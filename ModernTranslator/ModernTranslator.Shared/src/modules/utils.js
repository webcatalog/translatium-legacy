(function () {
  "use strict";

  var utils = WinJS.Utilities;

  var applicationData = Windows.Storage.ApplicationData.current;
  var localSettings = applicationData.localSettings;

  function standardlizeJSON(str) {
    var i = 0;
    var newstr = '';
    while (i < str.length) {
      if ((str[i] == ',') || (str[i] == '[')) {
        switch (str[i + 1]) {
          case ',':
          case ']':
          newstr += str[i] + 'null';
          i++;
          break;
          case '"':
          var tmp = str.substr(i + 2);
          var j = tmp.indexOf('"');
          while ((tmp[j - 1] == '\\') && (tmp[j-2] != '\\')) {
            j = j + 1 + tmp.substr(j + 1).indexOf('"');
          }
          j = i + 2 + j;
          newstr += str.substring(i, j + 1);
          i = j + 1;

          break;
          default:
          newstr += str[i];
          i++;
        }
      }
      else {
        newstr += str[i];
        i++;
      }
    }

    return newstr;
  }

  function getPurchaseDateAsync() {
    return WinJS.Promise.as().then(function () {
      if (typeof localSettings.values["purchased"] != 'undefined') return;
      var currentApp = Windows.ApplicationModel.Store.CurrentApp;
      var licenseInformation = currentApp.licenseInformation;

      if (licenseInformation.productLicenses.lookup("premium").isActive) {
        localSettings.values["purchased"] = true;
        return;
      }
      else {
        if (licenseInformation.isTrial == true) {
          localSettings.values["purchased"] = false;
          return;
        }
        return currentApp.getAppReceiptAsync().then(function (txt) {
          var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
          xmlDoc.loadXml(txt);
          var purchaseDate = new Date(xmlDoc.getElementsByTagName("AppReceipt")[0].attributes.getNamedItem("PurchaseDate").value);
          var pivotDate = new Date("2015-03-29T03:00:00Z");
          if (purchaseDate <= pivotDate)
          localSettings.values["purchased"] = true;
        });
      }
    }).then(null, function (err) { });
  }

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
    getPurchaseDateSync: getPurchaseDateAsync,
    standardlizeJSON: standardlizeJSON,
    popupMsg: popupMsg,
    popupNoInternet: popupNoInternet,
    showNotif: showNotif,
    hideNotif: hideNotif,
    getDomain: getDomain
  });


})();
