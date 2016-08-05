(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var utils = WinJS.Utilities;
    var binding = WinJS.Binding;
    var ui = WinJS.UI;
    var app = WinJS.Application;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    WinJS.UI.Pages.define("/pages/settings/settings.html", {

        ready: function (element, options) {

          if (Windows.Storage.ApplicationData.current.roamingSettings.values.size > 0)
             Windows.Storage.ApplicationData.current.roamingSettings.values.clear()

            this.bindingData = {
                hideControlStatusbar: !Custom.Device.isPhone,
                showStatusbar: (typeof localSettings.values["statusbar"] != 'undefined') ? localSettings.values["statusbar"] : true,
                useRealtimeTranslation: (typeof localSettings.values["realtime-translation"] != 'undefined') ? localSettings.values["realtime-translation"] : true,
                useBing: (typeof localSettings.values["bing"] != 'undefined') ? localSettings.values["bing"] : false,
                useEnterToTranslate: (typeof localSettings.values["enter-to-translate"] != 'undefined') ? localSettings.values["enter-to-translate"] : true,
                usePreventLock: (typeof localSettings.values["prevent-lock"] != 'undefined') ? localSettings.values["prevent-lock"] : false,
                useChineseServer: (typeof localSettings.values["chinese-server"] != 'undefined') ? localSettings.values["chinese-server"] : false,
                useHTTPS: (typeof localSettings.values["https"] != 'undefined') ? localSettings.values["https"] : false,
                onclickBack: binding.initializer(function () {
                    nav.back();
                }),
                onclickSignIn: binding.initializer(function() {
                    Custom.Sync.signIn();
                }),
                toggleStatusbar: binding.initializer(function (e) {
                    localSettings.values["statusbar"] = e.srcElement.winControl.checked;
                    Custom.UI.applyStatusbar();
                }),
                toggleRealtimeTranslation: binding.initializer(function (e) {
                    localSettings.values["realtime-translation"] = e.srcElement.winControl.checked;
                }),
                toggleEnterToTranslate: binding.initializer(function (e) {
                    localSettings.values["enter-to-translate"] = e.srcElement.winControl.checked;
                }),
                togglePreventLock: binding.initializer(function (e) {
                    localSettings.values["prevent-lock"] = e.srcElement.winControl.checked;
                }),
                toggleChineseServer: binding.initializer(function (e) {
                    localSettings.values["chinese-server"] = e.srcElement.winControl.checked;
                })
            };
            binding.processAll(element, this.bindingData);
        },

        unload: function () {
        },

    });
})();
