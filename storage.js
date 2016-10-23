var Storage = {
  savePost: function(post) {
   	chrome.storage.sync.set({ post: post }, function() {
  	});
  },
  
  restorePost: function(defaultPost, callback) {
   	chrome.storage.sync.get({ post: defaultPost }, function(result) {
			callback(result.post);
		});
  },
  
  savePosts: function(posts) {
   	chrome.storage.local.set({ posts: posts }, function() {
  	});
  },
  
  restorePosts: function(defaultPosts, callback) {
   	chrome.storage.local.get({ posts: defaultPosts }, function(result) {
			callback(result.posts);
		});
  },
  
  saveAccessToken: function(accessToken) {
    chrome.storage.sync.set({ access_token: accessToken}, function() {
    });
  },
  
  restoreAccessToken: function(callback) {
    chrome.storage.sync.get({ access_token: null }, function(result) {
      callback(result.access_token);
    });
  }
};