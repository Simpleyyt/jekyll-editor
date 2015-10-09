(function(window) {
  'use strict';
  
  function Post(github) {
    this.github = github;
  }
  
  Post.prototype.getAll = function(callback) {
		callback = callback || function() {};
		var posts = [];
	  this.github.fetchPostList(root.user_info.login,function(e, s, r){
		  var post_infos = JSON.parse(r);
      for(var i = 0; i< post_infos.length; i++){
        this.github.getContent(post_infos[post_infos.length - 1 - i].path, function(c) {
          var post = postParse(c.content);
          if(c.date.match(/\d+-\d+-\d+/) == null) {
    				return;
    			}
          post['date'] = c.date;
          post['sha'] = c.sha;
          post['slug'] = c.url.replace(/^.*\//,'');
          
          if (callback)
            callback(clist);
        });
      }
	  });
  }
  
  window.Post = Post;
  
})(window);