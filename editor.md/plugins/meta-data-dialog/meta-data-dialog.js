/*!
 * Reference link dialog plugin for Editor.md
 *
 * @file        meta-data-dialog.js
 * @author      yitao
 * @version     1.0.0
 * @updateTime  2015-10-06
 * {@link       http://simpleyyt.github.io}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

		var pluginName   = "meta-data-dialog";
		
		var langs = {
			"zh-cn" : {
				dialog : {
					metaData : {
					  meta : "元数据",
						layout : "布局",
						title : '标题',
						categories : '目录',
						tags : '标签',
						date : '日期',
						slug : 'Slug',
						published : '发布'
					}
				}
			},
			"zh-tw" : {
				dialog : {
					metaData : {
					  meta : "元数据",
						layout : "布局",
						title : '标题',
						categories : '目录',
						tags : '标签',
						date : '日期',
						slug : 'Slug',
						published : '发布'
					}
				}
			},
			"en" : {
				dialog : {
					metaData : {
					  meta : "Meat Data",
						layout : "Layout",
						title : 'Title',
						categories : 'Categories',
						tags : 'Tags',
						date : 'Date',
						slug : 'Slug',
						published : 'Published'
					}
				}
			}
		};
		exports.fn.metaDataDialog = function(post, callback) {

			      $.extend(true, this.lang, langs[this.lang.name]);
            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
			      var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var dialogLang  = lang.dialog.metaData;
            var classPrefix = this.classPrefix;
			      var dialogName  = classPrefix + pluginName, dialog;
            var meta        = post.meta;
            
			      cm.focus();
			      
			      
            editor.find("." + dialogName).remove();

            if (true || editor.find("." + dialogName).length < 2)
            {
                if (!meta) {
                  meta = {
                    "title": "",
                    "layout": "post",
                    "categories": "",
                    "tags": ""
                  };
                }
                
                var dialogHTML = "<div class=\"" + classPrefix + "form\">" +
                                        "<label>" + dialogLang.title + "</label>" +
                                        "<input type=\"text\" value=\"" + (meta.title || "") + "\" meta-title />" +  
                                        "<br/>" +
                                        "<label>" + dialogLang.layout + "</label>" +
                                        "<input type=\"text\" value=\"" + (meta.layout || "post") + "\" meta-layout />" +
                                        "<br/>" +
                                        "<label>" + dialogLang.categories + "</label>" +
                                        "<input type=\"text\" value=\"" + (meta.categories || meta.category || "") + "\" meta-categories />" + 
                                        "<br/>" +
                                        "<label>" + dialogLang.tags + "</label>" +
                                        "<input type=\"text\" value=\"" + (meta.tags || "") + "\" meta-tags />" +
                                        "<br/>" +
                                        "<label>" + dialogLang.date + "</label>" +
                                        "<input type=\"text\" value=\"" + (post.date || "") + "\" meta-date />" +
                                        "<br/>" +
                                        "<label>" + dialogLang.slug + "</label>" +
                                        "<input type=\"text\" value=\"" + (post.slug || "") + "\" meta-slug />" +
                                        "<br/>" +
                                        "<label>" + dialogLang.published + "</label>" +
                                        "<input type=\"checkbox\" meta-published " + (meta.published ? "checked" : "") + "/>" +
                                        "<br/>" +
                                    "</div>";

                dialog = this.createDialog({   
                    name       : dialogName,
                    title      : dialogLang.meta,
                    width      : 380,
                    height     : 426,
                    content    : dialogHTML,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons : {
                        enter  : [lang.buttons.enter, function() {
                            
                            var title  = this.find("[meta-title]").val();
                            var layout   = this.find("[meta-layout]").val();
                            var categories   = this.find("[meta-categories]").val();
                            var tags = this.find("[meta-tags]").val();
                            var slug = this.find("[meta-slug]").val();
                            var date = this.find("[meta-date]").val();
                            var published = this.find('[meta-published]').val() == 'on';
                            
                            var meta = {
                              "title": title,
                              "layout": layout,
                              "categories": categories.split(","),
                              "tags": tags.split(","),
                              "slug": slug,
                              "date": date,
                              "published": published
                            };

                            if (callback)
                              callback(true, meta);
                            this.hide().lockScreen(false).hideMask();
                            
                            if (callback)
                              callback(false);
                            return false;
                        }],
                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();
                            return false;
                        }]
                    }
                });
            }
/*
			dialog = editor.find("." + dialogName);

			this.dialogShowMask(dialog);
			this.dialogLockScreen();
			dialog.show();
	*/		
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
