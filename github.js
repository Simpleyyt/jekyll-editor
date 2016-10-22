var Github = (function() {
  'use strict';
  var user_fetch_callback;
  var access_token;
  var user_info;

  var tokenFetcher = (function() {
    // Replace clientId and clientSecret with values obtained by you for your
    // application https://github.com/settings/applications.
    // var clientId = 'eafd892b0fef691e2baa';
    // var clientSecret = '3dd2f8b9838b50641fec3e871df9ecc790ed0983';
    var clientId = '47bc556ab4c7b373dbfa';
    var clientSecret = 'ba4b606c64371ba47c7aa551a8c803a2342703ae';
    var redirectUri = chrome.identity.getRedirectURL('provider_cb');
    var redirectRe = new RegExp(redirectUri + '[#\?](.*)');

    return {
      getToken: function(interactive, callback) {
        // In case we already have an access_token cached, simply return it.
        if (access_token) {
          callback(null, access_token);
          return;
        }

        var options = {
          'interactive': interactive,
          url:'https://github.com/login/oauth/authorize?client_id=' + clientId +
              '&reponse_type=token' +
              '&scope=user,repo' +
              '&access_type=online' +
              '&redirect_uri=' + encodeURIComponent(redirectUri)
        };
        chrome.identity.launchWebAuthFlow(options, function(redirectUri) {
          console.log('launchWebAuthFlow completed', chrome.runtime.lastError,
              redirectUri);

          if (chrome.runtime.lastError) {
            callback(new Error(chrome.runtime.lastError));
            return;
          }

          // Upon success the response is appended to redirectUri, e.g.
          // https://{app_id}.chromiumapp.org/provider_cb#access_token={value}
          //     &refresh_token={value}
          // or:
          // https://{app_id}.chromiumapp.org/provider_cb#code={value}
          var matches = redirectUri.match(redirectRe);
          if (matches && matches.length > 1)
            handleProviderResponse(parseRedirectFragment(matches[1]));
          else
            callback(new Error('Invalid redirect URI'));
        });

        function parseRedirectFragment(fragment) {
          var pairs = fragment.split(/&/);
          var values = {};

          pairs.forEach(function(pair) {
            var nameval = pair.split(/=/);
            values[nameval[0]] = nameval[1];
          });

          return values;
        }

        function handleProviderResponse(values) {
          console.log('providerResponse', values);
          if (values.hasOwnProperty('access_token'))
            setAccessToken(values.access_token);
          // If response does not have an access_token, it might have the code,
          // which can be used in exchange for token.
          else if (values.hasOwnProperty('code'))
            exchangeCodeForToken(values.code);
          else
            callback(new Error('Neither access_token nor code avialable.'));
        }

        function exchangeCodeForToken(code) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET',
                   'https://github.com/login/oauth/access_token?' +
                   'client_id=' + clientId +
                   '&client_secret=' + clientSecret +
                   '&redirect_uri=' + redirectUri +
              		  '&scope=user,repo' +
                   '&code=' + code);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.onload = function () {
            // When exchanging code for token, the response comes as json, which
            // can be easily parsed to an object.
            if (this.status === 200) {
              var response = JSON.parse(this.responseText);
              console.log(response);
              if (response.hasOwnProperty('access_token')) {
                setAccessToken(response.access_token);
              } else {
                callback(new Error('Cannot obtain access_token from code.'));
              }
            } else {
              console.log('code exchange status:', this.status);
              callback(new Error('Code exchange failed'));
            }
          };
          xhr.send();
        }

        function setAccessToken(token) {
          access_token = token;
          console.log('Setting access_token: ', access_token);
  				chrome.storage.local.set({"access_token":access_token},function(){
          	callback(null, access_token);
					});
        }
      },

      removeCachedToken: function(token_to_remove) {
        if (access_token == token_to_remove)
          access_token = null;
      }
    };
  })();

  function xhrWithDataAuth(method, url, data, callback) {
    var retry = true;
    var access_token;

    getToken();

    function getToken() {
      tokenFetcher.getToken(true, function(error, token) {
        console.log('token fetch', error, token);
        if (error) {
          callback(error);
          return;
        }

        access_token = token;
        requestStart();
      });
    }

    function requestStart() {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = requestComplete;
      xhr.send(data);
    }

    function requestComplete() {
      //console.log('requestComplete', this.status, this.response);
      if ( ( this.status < 200 || this.status >= 300 ) && retry) {
        retry = false;
        tokenFetcher.removeCachedToken(access_token);
        access_token = null;
        getToken();
      } else {
        callback(null, this.status, this.response);
      }
    }
  }


  function xhrWithAuth(method, url, interactive, callback) {
    var retry = true;
    var access_token;

    console.log('xhrWithAuth', method, url, interactive);
    getToken();

    function getToken() {
      tokenFetcher.getToken(interactive, function(error, token) {
        console.log('token fetch', error, token);
        if (error) {
          callback(error);
          return;
        }

         access_token = token;
        requestStart();
      });
    }

    function requestStart() {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = requestComplete;
      xhr.send();
    }

    function requestComplete() {
      //console.log('requestComplete', this.status, this.response);
      if (( this.status < 200 || this.status >=300 ) && retry) {
        retry = false;
        tokenFetcher.removeCachedToken(access_token);
        access_token = null;
        getToken();
      } else {
        callback(null, this.status, this.response);
      }
    }
  }

  function getUserInfo(interactive) {
    xhrWithAuth('GET',
                'https://api.github.com/user',
                interactive,
                onUserInfoFetched);
  }

  function onUserInfoFetched(error, status, response) {
    if (!error && status == 200) {
      //console.log("Got the following user info: " + response);
      user_info = JSON.parse(response);
      if (user_fetch_callback) {
        user_fetch_callback(false, user_info);
      }
    } else {
      console.log('infoFetch failed', error, status);
      if (user_fetch_callback) {
        user_fetch_callback(true);
      }
    }
  }

  function fetchUserRepos(repoUrl) {
    xhrWithAuth('GET', repoUrl, false, onUserReposFetched);
  }

	//-> Get the Post Folder Tree
  function fetchPostList(cb) {
    var user = user_info.login;
  	xhrWithAuth('GET',
			'https://api.github.com/repos/' + user + '/' + user + '.github.io/contents/_posts',
     	true,
	    cb);
	}
  function onUserReposFetched(error, status, response) {
  	//console.log(response);
  }

  // Handlers for the buttons's onclick events.

  function interactiveSignIn() {
    //disableButton(signin_button);
    tokenFetcher.getToken(true, function(error, access_token) {
      if (error) {
        //showButton(signin_button);
      } else {
        getUserInfo(true);
      }
    });
  }

  function revokeToken() {
    // We are opening the web page that allows user to revoke their token.
    window.open('https://github.com/settings/applications');
  }

  function fetchContent(ulink,cb) {
    	xhrWithAuth("GET", "https://api.github.com/repos/"+user_info.login+"/"+user_info.login+".github.io/contents/"+ulink, true, function(e,s,r){
				cb(e,s,r);
			});
  }

  return {
		transparentXhr:	function(method,url,cb){
  		xhrWithAuth(method, url, true, function(e,s,r){
				cb(e,s,r);
			});
		},

		updateContent: function(ulink, filename, content, sha, cb){
			var data = {
				message: 'update ' + filename,
				sha: sha,
				content:window.btoa(unescape(encodeURIComponent(content)))
			};

			if(sha === '') {
				delete data.sha;
			}
			var sdata = JSON.stringify(data);

			xhrWithDataAuth("PUT", "https://api.github.com/repos/"+user_info.login+"/"+user_info.login+".github.io/contents/"+ulink, sdata , function(e,s,r){
				cb(e,s,r);
			});
		},

		deleteContent: function(ulink,sha, cb){
			var data = {
				message: 'update from Jekyller',
				sha: sha
			};

			var sdata = JSON.stringify(data);

			xhrWithDataAuth("DELETE", "https://api.github.com/repos/"+user_info.login+"/"+user_info.login+".github.io/contents/"+ulink, sdata , function(e,s,r){
				cb(e,s,r);
			});
		},

		fetchPostContent: function(url,cb) {
		  fetchContent(url,function(e,s,r){
		    if(s == 200){
		      var json = JSON.parse(r);
		      cb({
		        status:'OK',
		        sha:  json.sha,
		        content: decodeURIComponent(escape(window.atob(json.content))),
		        filename: json.name,
		        date: json.name.replace(/^(\d+-\d+-\d+)-.*/,'$1'),
		        slug: json.name.replace(/^\d+-\d+-\d+-/,'').replace(/.md$/,'')
		      });
		    }
		  });
		},

  	fetchPostList: function(user, cb) {
			return fetchPostList(user,cb);
		},

    onUserFetched: function(callback) {
      user_fetch_callback = callback;
    },
    
    getUserInfo: function(type) {
      return getUserInfo(type);
    },
    login: function() {
      getUserInfo(true);
    },
    autoLogin: function() {
      Storage.restoreAccessToken(function(accessToken) {
        access_token = accessToken;
        getUserInfo(false);
      });
    }
  };
})();
