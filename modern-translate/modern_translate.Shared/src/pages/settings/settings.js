(function () {
    "use strict";
    
    var nav = WinJS.Navigation;
    var utils = WinJS.Utilities;
    var binding = WinJS.Binding;
    var ui = WinJS.UI;
    var app = WinJS.Application;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var roamingSettings = applicationData.roamingSettings;

    WinJS.UI.Pages.define("/pages/settings/settings.html", {

        ready: function (element, options) {

            var langArr = [{ name: WinJS.Resources.getString('default').value, tag: "" }];
            Windows.Globalization.ApplicationLanguages.manifestLanguages.forEach(function (tag, i) {
                var lang = new Windows.Globalization.Language(tag);
                langArr.push({
                    name: lang.displayName + " - " + lang.nativeName,
                    tag: tag
                });
            });

            this.bindingData = {
                currentDisplayLanguage: Windows.Globalization.ApplicationLanguages.primaryLanguageOverride,
                hideControlStatusbar: !Custom.Device.isPhone,
                showStatusbar: (typeof roamingSettings.values["statusbar"] != 'undefined') ? roamingSettings.values["statusbar"] : true,
                useRealtimeTranslation: (typeof roamingSettings.values["realtime-translation"] != 'undefined') ? roamingSettings.values["realtime-translation"] : true,
                useBing: (typeof roamingSettings.values["bing"] != 'undefined') ? roamingSettings.values["bing"] : false,
                useEnterToTranslate: (typeof roamingSettings.values["enter-to-translate"] != 'undefined') ? roamingSettings.values["enter-to-translate"] : true,
                usePreventLock: (typeof roamingSettings.values["prevent-lock"] != 'undefined') ? roamingSettings.values["prevent-lock"] : false,
                useChineseServer: (typeof roamingSettings.values["chinese-server"] != 'undefined') ? roamingSettings.values["chinese-server"] : false,
                useHTTPS: (typeof roamingSettings.values["https"] != 'undefined') ? roamingSettings.values["https"] : false,
                displayLangList: new WinJS.Binding.List(langArr).sort(function (a, b) {
                    return a.name - a.name;
                }),
                onclickBack: binding.initializer(function () {
                    nav.back();
                }),
                onclickClearAll: binding.initializer(function () {
                    var msg = new Windows.UI.Popups.MessageDialog(WinJS.Resources.getString("erase_all_tip").value, WinJS.Resources.getString("erase_all").value);
                    msg.commands.append(new Windows.UI.Popups.UICommand(
                        WinJS.Resources.getString("erase_all_short").value,
                        function () {
                            var tmpPurchase = roamingSettings.values["purchased"];
                            Custom.SQLite.localDatabase.close();
                            applicationData.clearAsync().then(function () {
                                return Custom.SQLite.setupDatabase();
                            }).then(function () {
                                roamingSettings.values["purchased"] = tmpPurchase;
                                Custom.UI.applyTheme();
                                Custom.UI.applyStatusbar();
                                nav.history.current.initialPlaceholder = true;
                                nav.navigate("/pages/settings/settings.html");
                            });
                        })
                    );
                    msg.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("cancel").value));
                    msg.defaultCommandIndex = 0;
                    msg.cancelCommandIndex = 1;
                    return msg.showAsync();
                }),
                onclickSignIn: binding.initializer(function() {
                    Custom.Sync.signIn();
                }),
                toggleStatusbar: binding.initializer(function (e) {
                    roamingSettings.values["statusbar"] = e.srcElement.winControl.checked;
                    Custom.UI.applyStatusbar();
                }),
                toggleRealtimeTranslation: binding.initializer(function (e) {
                    roamingSettings.values["realtime-translation"] = e.srcElement.winControl.checked;
                }),
                toggleBing: binding.initializer(function (e) {
                    roamingSettings.values["bing"] = e.srcElement.winControl.checked;
                }),
                toggleEnterToTranslate: binding.initializer(function (e) {
                    roamingSettings.values["enter-to-translate"] = e.srcElement.winControl.checked;
                }),
                togglePreventLock: binding.initializer(function (e) {
                    roamingSettings.values["prevent-lock"] = e.srcElement.winControl.checked;
                }),
                toggleChineseServer: binding.initializer(function (e) {
                    roamingSettings.values["chinese-server"] = e.srcElement.winControl.checked;
                }),
                toggleHTTPS: binding.initializer(function (e) {
                    roamingSettings.values["https"] = e.srcElement.winControl.checked;
                }),
                changeDisplayLanguage: binding.initializer(function (e) {
                    Windows.Globalization.ApplicationLanguages.primaryLanguageOverride = e.srcElement.value;
                    Custom.Data.loadlanguageList();
                })
            };
            binding.processAll(element, this.bindingData);
        },

        unload: function () {
        },

    });
})();
