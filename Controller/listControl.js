var root = null;
var plist = null;
var clist = [];
var curpost = null;
chrome.runtime.getBackgroundPage(function(r) { root = r;});


function listLocalClose(){
    $('.frame-pop.local').remove();
    $('.frame-mask').remove();
    $('.frame-icon.local.focus').removeClass('focus');
}

function listClose(){
    $('.frame-pop.remote').remove();
    $('.frame-mask').remove();
    $('.frame-icon.list.focus').removeClass('focus');
}

function listLocalPop(toggle){
  //- Toggle
  if(toggle && $('.frame-pop.local:visible').length>0) {
    listLocalClose();
    return 0;
  }

  listClose();
  var frame = $('<div class="frame-pop local"></div>');
  var mask = $('<div class="frame-mask"> </div>');
  $('body').append(frame);
  $('body').append(mask);

  $('.frame-pop').append('<div id="label-banner"> Meta </div>');
  //refresh pop
  //-> Get needed info
  refreshPostMeta();
  bindListAction(); //windowControl

  $('.frame-mask').show();
  $('.frame-pop').show();

}


function listPop(toggle){
  //- Toggle
  if(toggle && $('.frame-pop.remote:visible').length>0) {
    listClose();
    return 0;
  }

  listLocalClose();

  var frame = $('<div class="frame-pop remote"></div>');
  var mask = $('<div class="frame-mask"> </div>');
  $('body').append(frame);
  $('body').append(mask);

  $('.frame-pop').html('<div class=ajax-loader><img src="/assets/loader.gif"/></div>');
  $('.frame-pop .ajax-loader').hide();

  $('.frame-pop').append('<div id="tool-banner"><img id="refresh" src="/assets/refresh.png"/></div>');
  $('.frame-pop').append('<div id="label-banner">  Posts </div>');


  //refresh pop
  //-> Get needed info
  bindListAction(); //windowControl

  chrome.storage.local.get("clist",function(obj){
    if(typeof(obj.clist)!='undefined' && obj.clist.length>0) {
      clist = obj.clist;
      refreshPostList();
    }
  });

  $('.frame-mask').show();
  $('.frame-pop').show();

}

//获取博文列表


function getUserInfo(cb) {
  gh.transparentXhr('GET',
              'https://api.github.com/user',
               cb);
}

function getPostList(cb) {
  clist = [];
  if (!root.user_info.login) {
    if (cb) {
      cb(true, plist);
    }
    return;
  }
	gh.fetchPostList(root.user_info.login,function(e, s, r){
		plist = JSON.parse(r);
	  if (cb) {
	    cb(e, plist);
	  }
	});
}

function getPostDetails(plist, callback){
  for(var i = 0; i< plist.length; i++){
    //if(i==plist.length) break;
    gh.getContent(plist[plist.length-1-i].path,function(c){
      var pcontent;
      try {
        pcontent= postParse(c.content);
      } catch (err) {
        if (callback) {
          callback(true, err);
        }
        
      }
      if(c.date.match(/\d+-\d+-\d+/)==null) {
				return;
			}
      pcontent['date'] = c.date;
      pcontent['sha'] = c.sha;
      pcontent['slug'] = c.url.replace(/^.*\//,'');
      if (typeof pcontent.meta.published == "undefined") {
        pcontent.meta.published = true;
      }
      clist.push(pcontent);
      if (callback) {
        callback(false, clist);
      }
    });
  }
}

function refreshPostMeta(){
  $('#post-table').remove();
  $('.frame-pop').append('<div id="post-table"><table></table></div>');
  $('.frame-pop .ajax-loader').hide();
  $('.frame-pop table tr').remove();
	//- Title - Post -
  $('.frame-pop table').append('<tr><td class="title label">Title</td><td class="title content"><div>'+'<input placeholder="Post Title"  type="text"/>'+'</div></td><td class="title label">Slug</td><td class="slug content"><div>'+'<input placeholder="Post Slug"  type="text"/>'+'</div></td></tr>');
  $('.frame-pop table').append('<tr><td class="date label">Date</td><td class="date content"><div>'+'<input placeholder="YYYY-MM-DD"  type="text"/>'+'</div></td><td class="info label">'+'Info </td><td class="info content"> <input placeholder="User Defined Meta" type="text"/>'+'</td></tr>');
  $('.frame-pop table').append('<tr><td class="tag label">Tag</td><td class="tag content"><div>'+'<input placeholder="taga,tagb,etc."  type="text"/>'+'</div></td><td class="cate label">'+'Category </td><td class="cate content"> <input placeholder="catetorya,categoryb,etc." type="text"/>'+'</td></tr>');
  $('.frame-pop table').append('<tr><td class="comment label">Comment</td><td class="comment content"><div>'+'<input placeholder="User Defined Meta"  type="text"/>'+'</div></td><td class="post label">'+'Posted? </td><td class="post content"> <input type="checkbox"/><div class="send">Post</div>'+'</td></tr>');

	//-> LoadData
	if(curpost != null) {
		$('.content.title input').val(curpost.title);
		$('.content.date input').val(curpost.date);
		$('.content.slug input').val(curpost.slug);
		$('.content.info input').val(curpost.info);
		$('.content.comment input').val(curpost.comment);
		$('.content.tag input').val(toString(curpost.tags));
		$('.content.cate input').val(toString(curpost.categories));
		$('.content.post input').prop('checked',curpost.published);
		if(curpost.sha!=null || curpost.sha!="") {
			$('.send').text('Update');
		}
	}

	$('.send').click(function(){
	  if(root.user_info == null) {
	    return;
	  }
		$('.top-masker').show();
		storePost(function(){
			updatePost(function(){
				$('.top-masker').hide();
			});
		});
	})
}


function toString(inp){
	if(typeof(inp)=='undefined' || inp == null) return "";
	if(typeof(inp)=='string'){
		return inp;
	}else {
		var str = '';
		for(var i =0; i<inp.length; i++) {
			str = str + inp[i];
			if(i<inp.length-1)
				str = str + ',';
		}
		return str;
	}
}

function toArray(inp) {
	if(typeof(inp)=='undefined' || inp == null) return "";
	if(typeof(inp)=='string'){
		return inp.split(',');
	}
}

function refreshPostList(){
  $('#plist-table').remove();
  $('.frame-pop').append('<div id="plist-table"><table></table></div>');
  $('.frame-pop .ajax-loader').hide();
  $('.frame-pop table tr').remove();
  clist.every(function(v,i){
    $('.frame-pop table').append('<tr><td class="ind">*</td><td class="title"><div>'+v.title+'</div></td><td class="date"><a target=_blank href="http://'+root.user_info.login+'.github.io/'+v.slug+'">'+v.date+'</a></td></tr>');
    $('td.title:last').data('index',i);
    $('td.date:last').data('url',root.user_info.login+'.github.io/'+v.slug);
    if(i==clist.length-1) return false;
    return true;
  })


	$('td.ind').confirmOn({
 		questionText: 'Are You Sure to Delete This Post?',
		textYes: 'Yes, I\'m sure',
		textNo: 'No, I\'m not sure'
	},'click', function(e,confirmed){
		if(confirmed) {
			//console.log($('#plist-table').data('curind'));
			$('.top-masker').show();
			deletePost($('#plist-table').data('curind'),function(){
				$('.top-masker').hide();
			});
		}
	});

	$('td.ind').click(function(){
		$('#plist-table').data('curind', $(this).parent().find('td.title').data('index'));
	});

	$('td.title').click(function(){
		$('#plist-table').data('curind',$(this).data('index'));
	});

	$('td.title').confirmOn({
 		questionText: 'Local Post Will Be Overrided by This One, Is It OK?',
		textYes: 'Yes, I\'m sure',
		textNo: 'No, I\'m not sure'
 	 }, 'click', function(e, confirmed){
		if(confirmed)
    	loadText($('#plist-table').data('curind'));
  })
}

function loadText(ind) {
	//-> The Post are loaded inside!
	//console.info(clist[ind]);
  loadPost(clist[ind].content);
	//Title
	//$('.posttitle').text(clist[ind].title);
	curpost = clist[ind];
	storePost();
}

