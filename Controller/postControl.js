
function loadPost(content) {
	//reconstruct the code;
	var str = '';
	if (editor.state.loaded) {
	  editor.setMarkdown(content);
	}

}

function createNewPost(){
	var cur = new Date();
	var datestr = cur.getFullYear()+'-'+(Number(cur.getMonth())+1)+'-'+cur.getDate();
	var newpostmeta = {
		categories:'Uncategoried',
		tags:'',
		layout:'post',
		published:false,
		title:'Unnamed'
	};
	//->
	curpost['meta'] = newpostmeta;
	curpost['content']='';
	curpost['slug'] = 'the-post-'+parseInt(10000*Math.random());
	curpost['date'] = datestr;
	curpost['sha'] = '';
	loadCurPost();
}

function dumpPost(){
	var rst='';
	var contentstr = curpost.content;
	var meta = jQuery.extend({}, curpost.meta);
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
}

function loadCurPost() {
	//-> The Post are loaded inside!
  loadPost(curpost.content);
	//Title
	//$('.posttitle').text(curpost.title);
	storePost();
}

var msgLang = {
  'zh-cn': {
    update_success: '更新博客成功！',
    create_success: '创建博客成功！',
    conflict: '错误！版本存在冲突。',
    unknown: '未知错误！'
  },
  'zh-tw': {
    update_success: '更新博客成功！',
    create_success: '创建博客成功！',
    conflict: '错误！版本存在冲突。',
    unknown: '未知错误！'
  },
  'en': {
    update_success: 'Update post successfully!',
    create_success: 'Create post successfully!',
    conflict: 'Error due to version conflict, please to webpage to solve that, or reload the online version before update!',
    unknown: 'Error! Please check on web!'
  }
};

var msg = msgLang[langName];

function updatePost(cb){
  cb = cb || function() {};
  var name = curpost.date +'-'+ curpost.slug;
  var content = dumpPost();
	//console.log(content);
  //PUT /repos/:owner/:repo/contents/:path
  var sha = curpost.sha;
  var filename = name + '.md';
  var path = '_posts/'+ filename;
  console.log(path);
	gh.updateContent(path, filename, content, sha, function(e,r,s){
		console.log(e);
		if(r=='200') {	//Done
			var ucontent = JSON.parse(s);	
			//logInfo('Update Post Successfully!');
			cb(false, msg.update_success);
			//remove the local list Item, as info expired
			for(var i =0; i< clist.length; i++){
				console.log(clist[i].sha);
				if(clist[i].sha == curpost.sha){
					clist[i] = $.extend({},curpost);
					//Align current
					curpost.sha = ucontent.content.sha;
					clist[i].sha = ucontent.content.sha;
					break;
				}
			}
			storePost();
			/*
   		chrome.storage.local.set({clist:clist},function(){
				//$('.frame-mask').click();
			});
			*/
		} else if(r=='201') { //Created
			var ucontent = JSON.parse(s);	
			//logInfo('Create Post Successfully!');
			cb(false, msg.create_success);
			//-> Need to refresh the list
			/*
			curpost.sha = ucontent.content.sha;
			//remove old one
			clist.pop();
			clist.push($.extend({},curpost));
			storePost();
   		chrome.storage.local.set({clist:clist},function(){
				//$('.frame-mask').click();
			});
			*/
		} else if(r=='409') { //Failed
			//logError('Error due to version conflict, please to webpage to solve that, or reload the online version before update!');
			cb(true, msg.conflict);
		} else {
			//logError('Error Please Check On Web! ');
			cb(true, msg.unknown);
		}
	});
}

function deletePost(ind,cb){
	var delpost = clist[ind];
  var name = delpost.date +'-'+ delpost.slug;
  //DELETE /repos/:owner/:repo/contents/:path
  var sha = delpost.sha;
  var path = '_posts/'+name+'.md';
  console.log(path);
	gh.deleteContent(path, sha, function(e,r,s){
		console.log(e);
		var deli = null;
		if(r=='200') {	//Done
			var ucontent = JSON.parse(s);	
			logInfo('Delete Post Successfully!');
			//remove the local list Item, as info expired
			for(var i =0; i< clist.length; i++){
				if(clist[i].sha == delpost.sha){
					deli = i;
					break;
				}
			}
			//Remove
			if(deli!=null)
				clist.remove(deli);
   		chrome.storage.local.set({clist:clist},function(){
				$('.frame-mask').click();
			});
		} else {
			logError('Error Please Check On Web! ');
		}
		if(typeof(cb)!='undefined') cb();
	});
}

function syncLocalPost(){
   	chrome.storage.sync.set({syncpost:curpost},function(){
			console.log('sync done');
		});
}

function getLocalPost(cb){
   	chrome.storage.sync.get({syncpost:null},function(o){
			console.log(o);
			console.log('sync done');
			cb(o.syncpost);
		});
}
