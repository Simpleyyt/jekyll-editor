var langName = "en";

if (chrome.i18n.getUILanguage() == 'zh-CN') {
  langName = "zh-cn";
}

if (chrome.i18n.getUILanguage() == 'zh-TW') {
  langName = "zh-tw";
}