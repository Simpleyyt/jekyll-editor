/*!
 * HTML entities dialog plugin for Editor.md
 *
 * @file        post-entities-dialog.js
 * @author      yitao
 * @version     1.0.0
 * @updateTime  2015-10-06
 * {@link       https://simpleyyt.github.io}
 * @license     MIT
 */

(function() {

	var factory = function (exports) {

		var $            = jQuery;
		var pluginName   = "post-entities-dialog";
		var selected     = -1;

		var langs = {
			"zh-cn" : {
				dialog : {
					postEntities : {
						title : "博文列表",
				    loading : "加载中..."
					}
				}
			},
			"zh-tw" : {
				dialog : {
					postEntities : {
						title : "博文列表",
				    loading : "加载中..."
					}
				}
			},
			"en" : {
				dialog : {
					postEntities : {
						title : "Post List",
				    loading : "loading..."
					}
				}
			}
		};
		
		exports.fn.postEntitiesDialog = function(entitiesData, isLoading, callback) {
			$.extend(true, this.lang, langs[this.lang.name]);
			var _this       = this;
			var cm          = this.cm;
			var lang        = _this.lang;
			var settings    = _this.settings;
			var path        = settings.pluginPath + pluginName + "/";
			var editor      = this.editor;
			var cursor      = cm.getCursor();
			var selection   = cm.getSelection();
			var classPrefix = _this.classPrefix;
			var entitiesData;

			var dialogName  = classPrefix + "dialog-" + pluginName, dialog;
			var dialogLang  = lang.dialog.postEntities;

			var dialogContent = [
				'<div class="' + classPrefix + 'html-entities-box" style=\"width: 760px;height: 334px;margin-bottom: 8px;overflow: hidden;overflow-y: auto;\">',
				'<div class="' + classPrefix + 'grid-table">',
				'</div>',
				'</div>',
			].join("\r\n");

			cm.focus();

			if (editor.find("." + dialogName).length > 0) 
			{
        dialog = editor.find("." + dialogName);

				selected = -1;
				dialog.find("a").removeClass("selected");

				this.dialogShowMask(dialog);
				this.dialogLockScreen();
				dialog.show();
			} 
			else
			{
				dialog = this.createDialog({
					name       : dialogName,
					title      : dialogLang.title,
					width      : 800,
					height     : 475,
					mask       : settings.dialogShowMask,
					drag       : settings.dialogDraggable,
					content    : dialogContent,
					lockScreen : settings.dialogLockScreen,
					maskStyle  : {
						opacity         : settings.dialogMaskOpacity,
						backgroundColor : settings.dialogMaskBgColor
					},
					buttons    : {
						enter  : [lang.buttons.enter, function() {							
							//cm.replaceSelection(selecteds.join(" "));
							if (callback) {
							  if (selected >= 0 && !entitiesData[selected].loading) {
							    callback(true, selected);
							  } else {
							    callback(false);
							  }
							}
							this.hide().lockScreen(false).hideMask();
							
							return false;
						}],
						cancel : [lang.buttons.cancel, function() {       
						  if (callback) {
						    callback(false);
						  }
							this.hide().lockScreen(false).hideMask();
							
							return false;
						}]
					}
				});
			}
				
			var table = dialog.find("." + classPrefix + "grid-table");

			var drawTable = function() {

				if (entitiesData.length < 1) return ;

				var rowNumber = 1;
				var pageTotal = Math.ceil(entitiesData.length / rowNumber);

				table.html("");
				
				for (var i = 0; i < pageTotal; i++)
				{
					var row = "<div class=\"" + classPrefix + "grid-table-row\">";
					
					for (var x = 0; x < rowNumber; x++)
					{
						var entity = entitiesData[(i * rowNumber) + x];
						
						if (entity.loading) {
						  row += "<a href=\"javascript:;\" value=\"" + i + "\" title=\"" + dialogLang.loading + 
							  "\" class=\"" + classPrefix + "html-entity-btn\">" + dialogLang.loading + "</a>";
							continue;
						}
						if (typeof entity !== "undefined")
						{
							var name = "Untitled";
							if (entity.meta.title)
							  name = entity.meta.date + '\t' + entity.meta.title.replace("&amp;", "&");

							row += "<a href=\"javascript:;\" value=\"" + i + "\" title=\"" + name + 
							  "\" class=\"" + classPrefix + "html-entity-btn\" style=\"text-align: left; padding-left: 10%;\">" + name + "</a>";
						}
					}
					
					row += "</div>";
					
					table.append(row);
				}

				dialog.find("." + classPrefix + "html-entity-btn").bind(exports.mouseOrTouch("click", "touchend"), function() {
          dialog.find("." + classPrefix + "html-entity-btn").removeClass("selected");
					$(this).toggleClass("selected");
					if ($(this).hasClass("selected")) 
					{
						selected = parseInt($(this).attr("value"));
					}
				});
			};
			var loading = dialog.find("." + classPrefix + "dialog-mask");
			/*
			drawTable();
			if (isLoading) {
        loading["show"]();
			} else {
        loading["hide"]();
			}
			*/
			
			return {
			  loading: function() {
			    entitiesData = [{ loading: true}];
			    drawTable();
			    //loading[(show) ? "show" : "hide"]();
			  },
			  setPostEntities: function(entities) {
			    entitiesData = entities;
			    drawTable();
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
