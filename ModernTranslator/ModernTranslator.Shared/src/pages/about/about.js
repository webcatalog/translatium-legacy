(function () {
  "use strict";

  var nav = WinJS.Navigation;
  var utils = WinJS.Utilities;
  var binding = WinJS.Binding;
  var ui = WinJS.UI;

  WinJS.UI.Pages.define("/pages/about/about.html", {
    ready: function (element, options) {
      var p = Windows.ApplicationModel.Package.current.id.version;
      this.bindingData = WinJS.Binding.as({
        appVersion: "3.10.0",
        onclickBack: binding.initializer(function () {
          nav.back();
        }),
        onclickContact: binding.initializer(function () {
          var uri = new Windows.Foundation.Uri("mailto:support@moderntranslator.com");
          return Windows.System.Launcher.launchUriAsync(uri);
        }),
        onclickWebsite: binding.initializer(function () {
          var uri = new Windows.Foundation.Uri("http://moderntranslator.com");
          return Windows.System.Launcher.launchUriAsync(uri);
        })
      });

      var list = "";
      var number = Custom.Data.languageList.length;
      var count = 0;
      Custom.Data.languageList.forEach(function (item) {
        if ((item.language_id == "auto") || (item.main == 0)) {
          number--;
          return;
        }
        count++;
        list += item.language_name + ", ";
      });
      list = list.substring(0, list.length - 2) + ".";
      this.bindingData.languageList = list;
      this.bindingData.feature_new_1 = WinJS.Resources.getString("feature_new_1").value.replace("{1}", number);

      binding.processAll(element, this.bindingData);

    },

    unload: function () {
    }
  });
})();
