$(function() {
  var curpost;
  var postList = [];
  var postsDialog;
  
  var initEditor = function() {
    editor = editormd("editormd", {
      path : "editor.md/lib/", // Autoload modules mode, codemirror, marked... dependents libs path
      width   : "100%",
      height : 100,
      emoji : true,
      lang : langs[langName],
      
      toolbarIcons : function() {
          // Or return editormd.toolbarModes[name]; // full, simple, mini
          // Using "||" set icons align right.
          return [
            "undo", "redo", "|", 
            "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", 
            "h1", "h2", "h3", "h4", "|", 
            "list-ul", "list-ol", "hr", "|",
            "link", "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime", "emoji", "html-entities", "pagebreak", "|",
            "search", "|",
            "||",
            "login", "preview", "new", "postentities", "meta", "commit", "help", "info"];
      },
      
      onload : function() {
        //Fix Bug: editor not extend when empty
        editor.setMarkdown(" ");
        //force fullscreen (just the content)
        this.fullscreen();
        
        //Load local posts
        Storage.restorePost(Post.new(), function(post) {
          curpost = post;
          editor.setMarkdown(post.content);
        });
        Storage.restorePosts(postList, function(posts) {
          postList = posts;
          postList.unshift({ loading: true});
          if (postsDialog)
            postsDialog.setPostEntities(postList);
        });
        
        Github.onUserFetched(function(error, user_info) {
          if (!error) {
            //this.toolbar.find(".fa[name=login]").html(user_info.login);
            this.settings.toolbarIconTexts.login = user_info.login;
            this.settings.lang.toolbar.login = user_info.login;
            this.setToolbar();
            // sync the posts
            Post.sync(postList, function(posts) {
              postList = posts;
              Storage.savePosts(postList);
              if (postsDialog)
                postsDialog.setPostEntities(postList);
            });
          } else {
            this.settings.toolbarIconTexts.login = this.lang.toolbar.login;
            this.settings.lang.toolbar.login = this.lang.toolbar.login;
            this.setToolbar();
          }
        }.bind(this));
        //login at startup
        Github.autoLogin();
      },
      
      onfullscreenExit : function() {
        //force full screen
        this.fullscreen();
      },
      
      onchange : function() {
        curpost.content = editor.getMarkdown();
        Storage.savePost(curpost);
        var images = this.previewContainer.find("img");
        images = Array.prototype.slice.call(images);
        images.forEach(function(img) {
          //filter the converted url
          if (img.src.indexOf("blob:") === 0 || img.src.indexOf("chrome-extension:") === 0) {
            return;
          }
          Resource.load(img.src, function(url) {
            img.src = url;
          });
        });
      },
      
      toolbarIconsClass : {
          new : "fa-file",
          postentities : "fa-bars",
          meta : "fa-comment",
          commit: "fa-pencil-square-o"
      },
      
      toolbarIconTexts : {
          //customer icon and text
          login : "<i class=\"fa fa-spinner fa-spin\"></i>"
      },
      
      toolbarHandlers : {
          new : function(cm, icon, cursor, selection) {
            this.confirmDialog(this.lang.dialog.warn.title, this.lang.dialog.warn.content, function(ok) {
              if (ok) {
                curpost = Post.new();
                editor.setMarkdown(curpost.content);
              }
            });
          },
          
          login : function(cm, icon, cursor, selection) {
            Github.login();
            this.settings.toolbarIconTexts.login = "<i class=\"fa fa-spinner fa-spin\"></i>";
            this.settings.lang.toolbar.login = this.lang.toolbar.login + "...";
            this.setToolbar();
          },
          
          commit : function(cm, icon, cursor, selecton) {
            this.confirmDialog(this.lang.dialog.commit.title, this.lang.dialog.commit.content, function(ok) {
              if (ok) {
                var dialog = this.confirmDialog(this.lang.dialog.commit.title, this.lang.dialog.commit.title + '...');
                dialog.loading(true);
                Post.update(curpost, function(err, msg) {
                  if (err) {
                    dialog.setTitle(this.lang.dialog.error.title);
                    dialog.setContent(this.lang.dialog.error.content[msg]);
                  }
                  else {
                    dialog.setTitle(this.lang.dialog.succ.title);
                    dialog.setContent(this.lang.dialog.succ.content[msg]);
                    Storage.savePost(curpost);
                  }
                  dialog.loading(false);
                }.bind(this));
              }
            }.bind(this));
          },
          
          postentities : function(cm, icon, cursor, selection) {
              postsDialog = editor.postEntitiesDialog([], true, function(ok, selected) {
              if (ok) {
                editor.confirmDialog(editor.lang.dialog.warn.title, editor.lang.dialog.warn.content, function(ok) {
                  if (ok) {
                    curpost = $.extend({}, postList[selected]);
                    editor.setMarkdown(curpost.content);
                  }
                });
              }
            });
            postsDialog.setPostEntities(postList);
            //dialog.loading(true);
          },
          
          meta : function(cm, icon, cursor, selection) {
            this.metaDataDialog(curpost.meta, function(ok, meta) {
              if (ok) {
                curpost.meta = meta;
                Storage.savePost(curpost);
              }
            });
          }
      }
    });
    
    $(window).resize(function() {
      console.log("window resize");
      editor.fullscreenExit();
    });
  };
  
  if (langName == 'en') {
    editormd.loadScript("editor.md/languages/en", initEditor);
  } else if (langName == 'zh_TW') {
    editormd.loadScript("editor.md/languages/zh-tw", initEditor);
  } else {
    initEditor();
  }
});

