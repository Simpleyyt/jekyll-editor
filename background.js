/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

var user_info;	//git user info
var gh;					//git handler


chrome.app.runtime.onLaunched.addListener(function(launchData) {
  chrome.app.window.create('index.html', {
		id: 'mainPage',
		focused: true,
		outerBounds: {
			'minWidth': 1000,
			'minHeight':650,
			'width': 1000,
			'height':650
		}
	},function(curw){
	});
});



