var Post = {
  new: function() {
  	var date = new Date();
  	var datestr = date.getFullYear() + '-' + (Number(date.getMonth()) + 1) + '-' + date.getDate();
  	var meta = {
  		categories: 'Uncategoried',
  		tags: '',
  		layout: 'post',
  		published: false,
  		title: 'Unnamed',
  		date: datestr,
  		slug: 'the-post-' + parseInt(10000 * Math.random())
  	};
    return {
      content: null,
      meta: meta,
      sha: null
    };
  },
  getPosts: function(callback) {
		callback = callback || function() {};
		var posts = [];
	  Github.fetchPostList(function(e, s, r) {
		  var post_infos = JSON.parse(r);
		  var count = post_infos.length;
		  post_infos.forEach(function(post_info) {
		    Github.fetchPostContent(post_info.path, function(c) {
          var post = Post.parse(c.content);
          if(c.date.match(/\d+-\d+-\d+/) === null) {
    				return;
          }
          post['sha'] = c.sha;
          post.meta.slug = c.slug;
          post.meta.date = c.date;
          posts.push(post);
          count--;
          if (count === 0) {
            callback(posts);
          }
		    });
		  });
	  });
  },
  update: function(post, callback) {
    callback = callback || function() {};
    var name = post.meta.date +'-'+ post.meta.slug;
    var content = Post.dump(post);
    var sha = post.sha;
    console.log(sha);
    var filename = name + '.md';
    var path = '_posts/'+ filename;
    console.log(path);
  	Github.updateContent(path, filename, content, sha, function(e, s, r){
  		var json = JSON.parse(r);
  		if(s == '200') {	//Done
  			callback(false, "updated");
  		} else if(s == '201') { //Created
  		  post.sha = json.content.sha;
  			callback(false, "created");
  		} else if(s == '409') { //Failed
  			callback(true, "conflict");
  		} else {
  			callback(true, "unknow");
  		}
  	});
  },
  dump: function(post) {
  	var rst='';
  	var contentstr = post.content;
  	var meta = $.extend({}, post.meta);
  	delete meta.slug;
  	delete meta.date;
  	if (meta.published) {
  	  delete meta.published;
  	}
  	if (meta.categories && meta.categories.length == 1) {
  	  meta.category = meta.categories[0];
  	  delete meta.categories;
  	}
  	var metastr = YAML.stringify(meta);
  	rst = rst + '---\n';
  	rst = rst + metastr;
  	rst = rst + '---\n';
  	rst = rst + contentstr;
  	return rst;
  },
  parse: function(rawContent) {
    var mt;
    //get the yaml matters
    var patt = /---([\s\S]*?)---(\r\n|\n)([\s\S]*)/;
    var res = rawContent.match(patt);
    mt = {};
    mt['meta'] = YAML.parse(res[1]);
    mt['content'] = res[3];
    return mt;
  }
};