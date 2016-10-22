var langName = "en";

if (chrome.i18n.getUILanguage() == 'zh-CN') {
  langName = "zh-cn";
}
else if (chrome.i18n.getUILanguage() == 'zh-TW') {
  langName = "zh-tw";
}
else {
  langName = "en";
}

var langs = {
	"zh-cn" : {
	  dialog : {
	    commit : {
	      title : "提交",
	      content : "确定要提交博文吗？"
	    },
	    warn : {
	      title : "警告",
	      content : "本地博文将会被覆盖，是否继续？"
	    },
	    succ : {
	      title : "成功",
	      content : {
	        "updated" : "更新博客成功！",
	        "created" : "创建博客成功！"
	      }
	    },
	    error: {
	      title : "错误",
	      content : {
	        "conflict" : "错误！版本存在冲突。",
	        "unknow" : "未知错误！"
	      }
	    }
	  },
		toolbar : {
		  new : "新博文",
			login : "登录",
			meta : "元信息",
			postentities : "博客列表",
			commit : "提交"
		}
	},
	"zh-tw" : {
	  dialog : {
	    commit : {
	      title : "提交",
	      content : "确定要提交博文吗？"
	    },
	    warn : {
	      title : "警告",
	      content : "本地博文将会被覆盖，是否继续？"
	    },
	    succ : {
	      title : "成功",
	      content : {
	        "updated" : "更新博客成功！",
	        "created" : "创建博客成功！"
	      }
	    },
	    error: {
	      title : "错误",
	      content : {
	        "conflict" : "错误！版本存在冲突。",
	        "unknow" : "未知错误！"
	      }
	    }
	  },
		toolbar : {
		  new : "新博文",
			login : "登录",
			meta : "元信息",
			postentities : "博客列表",
			commit : "提交"
		}
	},
	"en" : {
	  dialog : {
	    commit : {
	      title : "Commit",
	      content : "Do you want to commit the post?"
	    },
	    warn : {
	      title : "Warning",
	      content : "Local post will be emptied, is it OK?"
	    },
	    succ : {
	      title : "Successful",
	      content : {
	        "updated" : "Update post successfully!",
	        "created" : "Create post successfully!"
	      }
	    },
	    error: {
	      title : "Error",
	      content : {
	        "conflict" : "Error due to version conflict, please to webpage to solve that, or reload the online version before update!",
	        "unknow" : "Error! Please check on web!"
	      }
	    }
	  },
		toolbar : {
		  new : "New Blog",
			login : "login",
			meta : "Meta Data",
			postentities : "Post List",
			commit : "commit"
		}
	}
}