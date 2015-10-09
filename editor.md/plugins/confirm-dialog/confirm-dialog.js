/*!
 * Confirm dialog plugin for Editor.md
 *
 * @file        confirm-dialog.js
 * @author      yitao
 * @version     1.0.0
 * @updateTime  2015-10-05
 * {@link       https://simpleyyt.github.io}
 * @license     MIT
 */

(function() {

	var factory = function (exports) {

		var $            = jQuery;
		var pluginName   = "confirm-dialog";

		exports.fn.confirmDialog = function(title, content, cb) {
			var _this       = this;
			var lang        = this.lang;
			var editor      = this.editor;
			var settings    = this.settings;
			var path        = settings.pluginPath + pluginName + "/";
			var classPrefix = this.classPrefix;
			var dialogName  = classPrefix + pluginName, dialog;
			var dialogLang  = lang.dialog.help;
      editor.find("." + dialogName).remove();
			if (true || editor.find("." + dialogName).length < 1)
			{			
				var dialogContent = "<p class=\"" + classPrefix + "content\">" + content + "</p>";
				
				dialog = this.createDialog({
					name       : dialogName,
					title      : title,
					width      : 400,
					height     : 180,
					mask       : settings.dialogShowMask,
					drag       : settings.dialogDraggable,
					content    : dialogContent,
					lockScreen : settings.dialogLockScreen,
					maskStyle  : {
						opacity         : settings.dialogMaskOpacity,
						backgroundColor : settings.dialogMaskBgColor
					},
					buttons    : {
					  enter : [lang.buttons.enter, function() {
							this.hide().lockScreen(false).hideMask();
					    if (cb) {
					      cb(true);
					    }
					    return false;
					  }],
						cancel : [lang.buttons.cancel, function() {
							this.hide().lockScreen(false).hideMask();
						  if (cb) {
						    cb(false);
						  }
							return false;
						}]
					}
				});
			}
      /*
			dialog = editor.find("." + dialogName);

			this.dialogShowMask(dialog);
			this.dialogLockScreen();
			dialog.find(".editormd-dialog-title").html(title);
			dialog.find("." + classPrefix + "content").html(content);
			*/
			dialog.show();
			var loading = dialog.find("." + classPrefix + "dialog-mask");
			
			return {
			  loading: function(show) {
			    loading[(show) ? "show" : "hide"]();
			  },
			  setTitle: function(title) {
			    dialog.find(".editormd-dialog-title").html(title);
			  },
			  setContent: function(content) {
			    dialog.find("." + classPrefix + "content").html(content);
			  }
			};
		};

	};
    
	// CommonJS/Node.js
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    { 
        module.exports = factory;
    }
	else if (typeof define === "function")  // AMD/CMD/Sea.js
    {
		if (define.amd) { // for Require.js

			define(["editormd"], function(editormd) {
                factory(editormd);
            });

		} else { // for Sea.js
			define(function(require) {
                var editormd = require("./../../editormd");
                factory(editormd);
            });
		}
	} 
	else
	{
        factory(window.editormd);
	}

})();
