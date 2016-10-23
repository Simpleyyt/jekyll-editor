var Resource = {
  _cache: {},
  
  load: function loadImage(url, callback){
    callback = callback || function() {};
    if(typeof(Resource._cache[url])!='undefined') {
				callback(Resource._cache[url]);
				console.log(url);
		} else {
  	  var xhr = new XMLHttpRequest();
    	xhr.responseType = 'blob';
	    xhr.onload = function() {
				var url = window.URL.createObjectURL(this.response);
				Resource._cache[this.responseURL] = url;
				callback(url);
	    };
	    xhr.open('GET', url, true);
	    xhr.send();
    }
  }
};