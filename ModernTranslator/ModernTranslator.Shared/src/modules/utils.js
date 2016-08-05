(function () {
  "use strict";

  var utils = WinJS.Utilities;

  var applicationData = Windows.Storage.ApplicationData.current;
  var localSettings = applicationData.localSettings;

  function popupNoInternet() {
    return Custom.Utils.popupMsg(WinJS.Resources.getString('no_internet').value, WinJS.Resources.getString("please_check_internet").value);
  };

  var msg;
  function popupMsg(title, content) {
    if (msg == null) {
      msg = new Windows.UI.Popups.MessageDialog(content, title);
      return msg.showAsync().then(function () { msg = null; });
    }
  };

  function showNotif(str) {
    if ((Custom.Device.isPhone) && (localSettings.values["statusbar"] != false)) {
      var statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
      statusBar.progressIndicator.progressValue = null;
      statusBar.progressIndicator.text = str;
      return statusBar.progressIndicator.showAsync();
    }
    else {
      navProgress.hidden = false;
    }
  }

  function hideNotif() {
    if ((Custom.Device.isPhone) && (localSettings.values["statusbar"] != false)) {
      var statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
      statusBar.progressIndicator.progressValue = 0;
      return statusBar.progressIndicator.hideAsync();
    }
    else {
      navProgress.hidden = true;
    }
  }

  function getDomain() {
    var useChineseServer = (typeof localSettings.values["chinese-server"] != 'undefined') ? localSettings.values["chinese-server"] : false;
    var useHTTPS = (typeof localSettings.values["https"] != 'undefined') ? localSettings.values["https"] : false;
    if (useChineseServer == true) return "http://translate.google.cn";
    if (useHTTPS) return "https://translate.google.com";
    return "http://translate.google.com";
  }

  WinJS.Namespace.define("Custom.Utils", {
    popupMsg: popupMsg,
    popupNoInternet: popupNoInternet,
    showNotif: showNotif,
    hideNotif: hideNotif,
    getDomain: getDomain
  });


})();
