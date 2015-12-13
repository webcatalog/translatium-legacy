(function () {
  "use strict";

  var nav = WinJS.Navigation;
  var utils = WinJS.Utilities;
  var binding = WinJS.Binding;
  var ui = WinJS.UI;

  WinJS.UI.Pages.define("/pages/premium/premium.html", {
    ready: function (element, options) {
      var that = this;

      var currentApp = Windows.ApplicationModel.Store.CurrentApp;
      var licenseInformation = currentApp.licenseInformation;
      
      var pivotDate = new Date("2015-03-29T03:00:00Z");
      var datefmt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("longdate");

      var p = Windows.ApplicationModel.Package.current.id.version;
      this.bindingData = WinJS.Binding.as({
        freeUpgradeMsg: WinJS.Resources.getString("free_upgrade_msg").value.replace("{1}", datefmt.format(pivotDate)),
        onclickBack: binding.initializer(function () {
          nav.back();
        }),
        isPremium: Custom.Utils.isPremium(),
        onclickBuy: binding.initializer(function () {
          currentApp.requestProductPurchaseAsync("premium")
          .then(function () {
            var isPremium = Custom.Utils.isPremium();
            that.bindingData.isPremium = isPremium;
            if (isPremium == true) {
              var adControlEl = document.querySelector("#adControl");
              if (adControlEl && adControlEl.winControl) {
                adControlEl.winControl.dispose();
                adControlEl.style.display = "none";
              }
            }
          }, function (err) { });
        }),
        onclickFreeUpgrade: binding.initializer(function () {
          return currentApp.getAppReceiptAsync().then(
            function (txt) {
              var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
              xmlDoc.loadXml(txt);
              var purchaseDate = new Date(xmlDoc.getElementsByTagName("AppReceipt")[0].attributes.getNamedItem("PurchaseDate").value);
              var pivotDate = new Date("2015-03-29T03:00:00Z");
              if (purchaseDate <= pivotDate) {
                return currentApp.requestProductPurchaseAsync("free.upgrade")
                .then(function () {
                  var isPremium = Custom.Utils.isPremium();
                  that.bindingData.isPremium = isPremium;
                  if (isPremium == true) {
                    var adControlEl = document.querySelector("#adControl");
                    if (adControlEl && adControlEl.winControl) {
                      adControlEl.winControl.dispose();
                      adControlEl.style.display = "none";
                    }
                  }
                }, function (err) { });
              }
              else {
                return Custom.Utils.popupMsg("Oops", WinJS.Resources.getString("not_qualified_for_free_upgrade").value)
              }
            },
            function(err) {
              return Custom.Utils.popupNoInternet()
            }
          );
        })
      });

      binding.processAll(element, this.bindingData);

      currentApp.loadListingInformationAsync("premium").then(function (info) {
        var price = info.productListings.premium.formattedPrice;
        element.querySelector(".price").innerText = price;
      }).then(null, function(err) {});
    }
  });
})();
