(function () {
    "use strict";

    var binding = WinJS.Binding;
    var nav = WinJS.Navigation;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var roamingSettings = applicationData.roamingSettings;

    WinJS.UI.Pages.define("/pages/p-pin/p-pin.html", {

        ready: function (element, options) {
            var that = this;

            if (Custom.Data.languageList.getAt(0).language_id == "auto")
                Custom.Data.languageList.shift();

            this.bindingData = binding.as({
                inputLang: (localSettings.values["inputLang"] == "auto") ? "en" : localSettings.values["inputLang"],
                outputLang: localSettings.values["outputLang"],
                hidePin: false,
                hideUnpin: true,
                onclickBack: binding.initializer(function () {
                    nav.back();
                }),
                onclickSwap: binding.initializer(function () {
                    var tmp = that.bindingData.inputLang;
                    that.bindingData.inputLang = that.bindingData.outputLang;
                    that.bindingData.outputLang = tmp;
                }),
                onchangeinputLang: binding.initializer(function (e) {
                    that.bindingData.inputLang = e.srcElement.value;
                }),
                onchangeoutputLang: binding.initializer(function (e) {
                    that.bindingData.outputLang = e.srcElement.value;
                }),
                onclickPin: binding.initializer(function (e) {
                    var inputLang = that.bindingData.inputLang;
                    var outputLang = that.bindingData.outputLang;
                    var appbarTileId = inputLang + "_" + outputLang;
                    var TileActivationArguments = "tile_shortcut";
                    var newTileDisplayName = WinJS.Resources.getString(inputLang).value + " <> "
                                           + WinJS.Resources.getString(outputLang).value;

                    if (Custom.Device.isPhone) {
                        var square150x150Logo = new Windows.Foundation.Uri("ms-appx:///images/Square150x150Logo.png");
                        var wide310x150Logo = new Windows.Foundation.Uri("ms-appx:///images/Wide310x150Logo.png");
                        var square310x310Logo = null;
                    }
                    else {
                        var square150x150Logo = new Windows.Foundation.Uri("ms-appx:///images/Square150x150Logo.png");
                        var wide310x150Logo = new Windows.Foundation.Uri("ms-appx:///images/Wide310x150Logo.png");
                        var square310x310Logo = new Windows.Foundation.Uri("ms-appx:///images/Square310x310Logo.png");
                    }

                    var newTileDesiredLogo = (Custom.Device.isPhone) ? square150x150Logo : square310x310Logo;
                    var newTileDesiredSize = Windows.UI.StartScreen.TileSize.square150x150;
                    var tile = new Windows.UI.StartScreen.SecondaryTile(appbarTileId,
                                                                        newTileDisplayName,
                                                                        TileActivationArguments + appbarTileId,
                                                                        newTileDesiredLogo,
                                                                        newTileDesiredSize);
                    tile.visualElements.showNameOnSquare150x150Logo = true;
                    tile.visualElements.foregroundText = Windows.UI.StartScreen.ForegroundText.light;
                    tile.visualElements.showNameOnWide310x150Logo = true;
                    tile.visualElements.wide310x150Logo = wide310x150Logo;
                    if (!Custom.Device.isPhone) {
                        tile.visualElements.showNameOnSquare310x310Logo = true;
                        tile.visualElements.square310x310Logo = square310x310Logo;
                    }

                    return tile.requestCreateAsync().then(function () { that.updateHidden(); }, function (err) { that.updateHidden(); });
                }),
                onclickUnpin: binding.initializer(function (e) {
                    var tileId = that.bindingData.inputLang + "_" + that.bindingData.outputLang;
                    var tileToDelete = new Windows.UI.StartScreen.SecondaryTile(tileId);
                    tileToDelete.requestDeleteAsync().then(function () { that.updateHidden(); }, function () { that.updateHidden(); });
                })
            });
            binding.processAll(element, this.bindingData);
            binding.bind(this.bindingData, {
                inputLang: function () {
                    that.updateHidden();
                },
                outputLang: function () {
                    that.updateHidden();
                }
            })
        },

        updateHidden: function () {
            var tileId = this.bindingData.inputLang + "_" + this.bindingData.outputLang;
            if (Windows.UI.StartScreen.SecondaryTile.exists(tileId))
                this.bindingData.hidePin = true;
            else
                this.bindingData.hidePin = false;
            this.bindingData.hideUnpin = !this.bindingData.hidePin;
        }
    });

})();
