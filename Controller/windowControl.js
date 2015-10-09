//Control Main windows' action
	$('img.close').click(function(){
	  //Avoid keep wrong initial status
	  chrome.app.window.current().restore();
	  $('.editorwrap').removeClass('max');
		chrome.app.window.current().close();
	});

	$('img.minimize').click(function(){
		chrome.app.window.current().minimize();
	});


	$('img.maximize').click(function(){
	  var curw = chrome.app.window.current();
	  if(curw.isMaximized()){
	    curw.restore();
	  	$('.op-span').removeClass('max');
	  } else {
	    curw.maximize();
	  	$('.op-span').addClass('max');
	  }
	});

	$('img.create').confirmOn({
 		questionText: 'Local Post Will Be Emptied , Is It OK?',
		textYes: 'Yes, I\'m sure',
		textNo: 'No, I\'m not sure'
 	 }, 'click', function(e, confirmed){
		if(confirmed)
    	createNewPost();
  })

	$('img.local').click(function(){
	  $('.focus').removeClass('focus');
	  $('.frame-icon.local').addClass('focus');
    listLocalPop(true);
	});

	$('img.list').click(function(){
	  $('.focus').removeClass('focus');
	  $('.frame-icon.list').addClass('focus');
    listPop(true);
	});



 function bindListAction(){
	$('.frame-mask').click(function(){
		listClose();
	  listLocalClose();
	});

	$('#refresh').click(function(){
	  getUserInfo(function(){
	    getPostList(getPostDetails);
	  });
	  $('.frame-pop .ajax-loader').show();
	});
 }

$('#user_info').click(function(){
});

function storePost(cb){
    /*
  if($('.frame-pop.local:visible').length>0) {
    if( $('.content.title input').val() != curpost['title'] ) {
      $('.posttitle').text($('.content.title input').val());
    }
    //Auto saving
    curpost['title'] = $('.content.title input').val();
    curpost['date'] = $('.content.date input').val();
    curpost['info'] = $('.content.info input').val();
    curpost['comment']=$('.content.comment input').val();
    curpost['tags']=toArray($('.content.tag input').val());
    curpost['categories']=toArray($('.content.cate input').val());
    curpost['published']=$('.content.post input').prop('checked');
    curpost['slug']=$('.content.slug input').val();
    
  }
  */

  curpost['content'] = editor.getMarkdown();

	//-> fill meta
  chrome.storage.local.set({'workingpost': curpost}, function(){
    console.log('store');
		syncLocalPost();
		if(typeof(cb)!='undefined') cb();
  });
}

function logInfo(str){
	console.info(str);
	$('.notification').removeClass('info').removeClass('error');
	$('.notification').text(str).addClass('info');
	$('.notification').show();
	setTimeout (function(){
		$('.notification').text('').hide();
	}, 2000);
}

function logError(str){
	console.error(str);
	$('.notification').removeClass('info').removeClass('error');
	$('.notification').text(str).addClass('error');
	$('.notification').show();
	setTimeout (function(){
		$('.notification').text('').hide();
	}, 2000);
}






