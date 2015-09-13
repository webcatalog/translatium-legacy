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

            var p = Windows.ApplicationModel.Package.current.id.version;
            this.bindingData = WinJS.Binding.as({
                onclickBack: binding.initializer(function () {
                    nav.back();
                }),
                isPremium: Custom.Utils.isPremium(),
                onclickBuy: binding.initializer(function () {
                    currentApp.requestProductPurchaseAsync("premium")
                        .then(function () {
                            that.bindingData.isPremium = Custom.Utils.isPremium();
                        }, function (err) { });
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
