(function () {
    "use strict";

    var binding = WinJS.Binding;
    var nav = WinJS.Navigation;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    WinJS.UI.Pages.define("/pages/p-zoom/p-zoom.html", {

        ready: function (element, options) {
            var that = this;
            this.bindingData = binding.as({
                zoomFontsize: (typeof localSettings.values["zoom-fontsize"] == "undefined") ? 50 : localSettings.values["zoom-fontsize"] ,
                zoomFontsizePX: (typeof localSettings.values["zoom-fontsize"] == "undefined") ? "50px" : localSettings.values["zoom-fontsize"] + "px",
                zoomText: (options && options.text) ? options.text : "",
                onclickBack: binding.initializer(function () {
                    nav.back();
                }),
                onchangeSize: binding.initializer(function (evt) {
                    localSettings.values["zoom-fontsize"] = evt.srcElement.value;
                    that.bindingData.zoomFontsize = localSettings.values["zoom-fontsize"];
                }),
            });

            binding.processAll(element, that.bindingData);
            binding.bind(this.bindingData, {
                zoomFontsize: function () {
                    that.bindingData.zoomFontsizePX = that.bindingData.zoomFontsize + "px";
                },
            })

        },

        unload: function () {
        },

    });
})();
