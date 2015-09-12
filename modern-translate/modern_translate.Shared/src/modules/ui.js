(function () {
    "use strict";

    var app = WinJS.Application;
    var utils = WinJS.Utilities;
    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var roamingSettings = applicationData.roamingSettings;

    function importCSS(url) {
        var ss = document.styleSheets;
        for (var i = 0, max = ss.length; i < max; i++) {
            if (ss[i].href == url)
                return;
        }
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;

        document.getElementsByTagName("head")[0].appendChild(link);
    }

    function applyTheme() {
        return WinJS.Promise.as().then(function () {

            if (typeof roamingSettings.values["x-theme"] == "undefined")
                roamingSettings.values["x-theme"] = "light";

            if (typeof roamingSettings.values["y-theme"] == "undefined")
                roamingSettings.values["y-theme"] = "light-green";

            var x_theme = roamingSettings.values["x-theme"];
            var y_theme = roamingSettings.values["y-theme"];

            importCSS("/Microsoft.WinJS.4.0/css/ui-" + x_theme + ".css");
            importCSS("/WinJS.Material/css/material-" + x_theme + ".css");
            importCSS("/WinJS.Material/css/themes/" + y_theme + ".css");

            document.body.setAttribute('x-theme', x_theme);
            document.body.setAttribute('y-theme', y_theme);
            if (Custom.Device.isPhone) 
                utils.addClass(document.body, "phone");
        });
    }

    function applyStatusbar() {
        return WinJS.Promise.as().then(function () {

            var backgroundColor = null;
            var foregroundColor = { r: 255, g: 255, b: 255, a: 1 };

            var y_theme = roamingSettings.values["y-theme"];
            Custom.Data.themeYList.every(function (data) {
                if (data.name == y_theme) {
                    backgroundColor = data.statusbar;
                    return false;
                }
                return true;
            });


            if (Custom.Device.isPhone) {
                var statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
                if (roamingSettings.values["statusbar"] != false) {
                    if (backgroundColor) {
                        statusBar.backgroundColor = backgroundColor;
                        statusBar.foregroundColor = { r: 255, g: 255, b: 255, a: 1 };
                        statusBar.backgroundOpacity = 1;
                        statusBar.showAsync();
                    }
                }
                else {
                    statusBar.hideAsync();
                }
            }
            else {
                // PC
                if (Windows.UI && Windows.UI.ViewManagement && Windows.UI.ViewManagement.ApplicationView) {
                    var v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
                    v.titleBar.backgroundColor = backgroundColor;
                    v.titleBar.foregroundColor = foregroundColor;
                    v.titleBar.buttonBackgroundColor = backgroundColor;
                    v.titleBar.buttonForegroundColor = foregroundColor;
                }
            }
        });
    }

    WinJS.Namespace.define("Custom.UI", {
        importCSS: importCSS,
        applyTheme: applyTheme,
        applyStatusbar: applyStatusbar
    });


})();