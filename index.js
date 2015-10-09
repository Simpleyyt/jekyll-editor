  
  $(function() {
        var langs = {
    			"zh-cn" : {
    			  dialog : {
    			    commit : {
    			      title : "提交",
    			      content : "确定要提交博文吗？"
    			    },
    			    warn : {
    			      title : "警告",
    			      content : "本地博文将会被覆盖，是否继续？"
    			    }
    			  },
    				toolbar : {
    				  new : "新博文",
    					login : "登录",
    					meta : "元信息",
    					postentities : "博客列表",
    					commit : "提交"
    				}
    			},
    			"zh-tw" : {
    			  dialog : {
    			    commit : {
    			      title : "提交",
    			      content : "确定要提交博文吗？"
    			    },
    			    warn : {
    			      title : "警告",
    			      content : "本地博文将会被覆盖，是否继续？"
    			    }
    			  },
    				toolbar : {
    				  new : "新博文",
    					login : "登录",
    					meta : "元信息",
    					postentities : "博客列表",
    					commit : "提交"
    				}
    			},
    			"en" : {
    			  dialog : {
    			    commit : {
    			      title : "Commit",
    			      content : "Do you want to commit the post?"
    			    },
    			    warn : {
    			      title : "Warning",
    			      content : "Local post will be emptied, is it OK?"
    			    }
    			  },
    				toolbar : {
    				  new : "New Blog",
    					login : "login",
    					meta : "Meta Data",
    					postentities : "Post List",
    					commit : "commit"
    				}
    			}
    		};
    		var initEditor = function() {
        editor = editormd("editormd", {
            path : "editor.md/lib/", // Autoload modules mode, codemirror, marked... dependents libs path
            width   : "100%",
            height : 100,
            emoji : true,
            toolbarIcons : function() {
                // Or return editormd.toolbarModes[name]; // full, simple, mini
                // Using "||" set icons align right.
                return [
                  "undo", "redo", "|", 
                  "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", 
                  "h1", "h2", "h3", "h4", "|", 
                  "list-ul", "list-ol", "hr", "|",
                  "link", "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime", "emoji", "html-entities", "pagebreak", "|",
                  "search", "|",
                  "||",
                  "login", "preview", "new", "postentities", "meta", "commit", "help", "info"];
            },
            onload : function() {
              this.fullscreen();
              restorePost();
              gh.onUserFetched(function(error, user_info) {
                console.log("user info");
                if (!error) {
                  //this.toolbar.find(".fa[name=login]").html(user_info.login);
                  this.settings.toolbarIconTexts.login = user_info.login;
                  this.settings.lang.toolbar.login = user_info.login;
                  this.setToolbar();
                } else {
                  this.settings.toolbarIconTexts.login = this.lang.toolbar.login;
                  this.settings.lang.toolbar.login = this.lang.toolbar.login;
                  this.setToolbar();
                }
              }.bind(this));
            },
            onfullscreenExit : function() {
              this.fullscreen();
            },
            onchange : function() {
              storePost();
              var images = this.previewContainer.find("img");
              for (var i = 0; i < images.length; i++) {
                var img = images[i];
                if (img.src.indexOf("blob") === 0) {
                  continue;
                }
                var url = loadImage(img.src, function(URL) {
                  $.proxy(editor.settings.onchange, editor)();
                });
                if (url) {
                  img.src = url;
                }
              }
            },
            toolbarIconsClass : {
                new : "fa-file",  // 指定一个FontAawsome的图标类
                postentities : "fa-bars",
                meta : "fa-comment",
                commit: "fa-pencil-square-o"
            },
            
            toolbarIconTexts : {
                login : "<i class=\"fa fa-spinner fa-spin\"></i>"  // 如果没有图标，则可以这样直接插入内容，可以是字符串或HTML标签
            },

            lang : langs[langName],
            toolbarHandlers : {
                new : function(cm, icon, cursor, selection) {
                  this.confirmDialog(this.lang.dialog.warn.title, this.lang.dialog.warn.content, function(ok) {
                    if (ok) {
                      createNewPost();
                    }
                  });
                },
                login : function(cm, icon, cursor, selection) {
                  gh.login();
                  this.settings.toolbarIconTexts.login = "<i class=\"fa fa-spinner fa-spin\"></i>";
                  this.settings.lang.toolbar.login = this.lang.toolbar.login + "...";
                  this.setToolbar();
                },
                commit : function(cm, icon, cursor, selecton) {
                  this.confirmDialog(this.lang.dialog.commit.title, this.lang.dialog.commit.content, function(ok) {
                    if (ok) {
                      var dialog = this.confirmDialog(this.lang.dialog.commit.title, this.lang.dialog.commit.title + '...');
                      dialog.loading(true);
                      updatePost(function(error, msg) {
                        dialog.setContent(msg);
                        dialog.loading(false);
                      });
                    }
                  }.bind(this));
                },
                postentities : function(cm, icon, cursor, selection) {
                  var dialog = editor.postEntitiesDialog([], true, function(ok, selected) {
                        if (ok) {
                          editor.confirmDialog(editor.lang.dialog.warn.title, editor.lang.dialog.warn.content, function(ok) {
                            if (ok) {
                              loadText(selected);
                            }
                          });
                        }
                      });
                  dialog.loading(true);
                  getPostList(function(error, plist) {
                    if (!error) {
                      getPostDetails(plist, function(error, list) {
                        if (!error) { 
                          dialog.setPostEntities(list);
                          if (list.length == plist.length) {
                            dialog.loading(false);
                          }
                        } else {
                          dialog.loading(false);
                        }
                      });
                    } else {
                      dialog.loading(false);
                    }
                  }.bind(this));
                },
                meta : function(cm, icon, cursor, selection) {
                  this.metaDataDialog(curpost, function(ok, meta) {
                    if (ok) {
                      curpost.meta.title = meta.title;
                      curpost.meta.layout = meta.layout;
                      curpost.meta.categories = meta.categories;
                      curpost.meta.tags = meta.tags;
                      curpost.meta.published = meta.published;
                      curpost.slug = meta.slug;
                      curpost.date = meta.date;
                      storePost();
                    }
                  });
                }
            }
       });
       $(window).resize(function() {
         console.log("window resize");
         editor.fullscreenExit();
       });
    	};
    	
    		if (langName == 'en') {
    		  editormd.loadScript("editor.md/languages/en", initEditor);
    		} else if (langName == 'zh_TW') {
    		  editormd.loadScript("editor.md/languages/zh-tw", initEditor);
    		} else {
    		  initEditor();
    		}
  });
	var curpostLocal;
	
  var picCacheList = {};
  
  
  function restorePost() {
    chrome.storage.local.get({'workingpost':{
  		content:'Please start blogging.',
  		sha: null,
  		title: 'Untitled'
  	}},function(obj){
  		curpostLocal = obj.workingpost;
  		$('.posttitle').text(obj.workingpost['title']);
  		getLocalPost(function(o){
  			if(o===null){
  				curpost = curpostLocal;
  			} else {
  				curpost = o;
  			}
      	loadPost(curpost['content']);
      	console.log(curpost);
  		});
    });
  }

function loadImage(url, callback){
    callback = callback || function(url) {};
		var hashc = hashCode(url);
    if(typeof(picCacheList[hashc])!='undefined') {
				return (picCacheList[hashc]);
		} else {
  	  var xhr = new XMLHttpRequest();
    	xhr.responseType = 'blob';
	    xhr.onload = function() {
				var url = window.URL.createObjectURL(this.response);
				picCacheList[hashCode(this.responseURL)] = url;
				callback(url);
	    };
	    xhr.open('GET', url, true);
	    xhr.send();
	    return null;
	  }
}

hashCode = function(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
};

//Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

