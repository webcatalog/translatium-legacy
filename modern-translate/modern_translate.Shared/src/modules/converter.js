(function () {
    "use strict";

    WinJS.Namespace.define("Custom.Converter", {
        languageString: WinJS.Binding.converter(function (language_id) {
            if (language_id == "auto") return WinJS.Resources.getString("auto").value;
            return WinJS.Resources.getString(language_id).value;
        }),
        swapDisabled: WinJS.Binding.converter(function (language_id) {
            if (language_id == "auto") return true;
            return false;
        }),
        speechDisabled: WinJS.Binding.converter(function (language_id) {
            var cn = "md md md-keyboard-voice";
            if (language_id == "auto") return cn + " disabled";

            var speechArr = [
              "af", "ar", "eu", "bg", "ca", "zh", "hr", "cs", "nl", "tl", "fi", "fr", "gl", "de", "iw", "hi", "hu", "is",
              "id",  "it", "ja", "ko", "ms", "no", "pl", "pt", "ro", "ru", "sr", "sk", "es", "sv", "th", "tr",
              "uk", "vi", "zu", "en"
            ]; // YES
            if (speechArr.indexOf(language_id) > -1) return cn;
            return cn + " disabled";
        }),
        gestureDisabled: WinJS.Binding.converter(function (language_id) {
            var gestureArr = ["hy", "ka", "ig", "ha", "yo", "yi", "st", "my", "si", "kk", "tg", "uz", "tlh", "otq", "yua"]; // NO
            if (gestureArr.indexOf(language_id) > -1) return true;
            return false;
        }),
        cameraDisabled: WinJS.Binding.converter(function (language_id) {
            var cn = "md md-camera-alt";
            var cameraArr = ["en", "zh", "zh-TW", "ce", "da", "nl", "fi", "fr", "de", "el", "hu", "it", "ja", "ko",
                             "no", "pl", "pt", "ru", "es", "sv", "tr"]; // YES
            if (cameraArr.indexOf(language_id) > -1) return cn;
            return cn + " disabled";;
        }),
        voiceDisabled: WinJS.Binding.converter(function (language_id) {
            var voiceArr = ["af", "sq", "ar", "hy", "bs", "ca", "zh", "zh-TW", "hr", "cs", "da",
                            "nl", "en", "eo", "fi", "fr", "de", "el", "ht", "hi", "hu", "is", "id", "it",
                            "ja", "ko", "la", "lv", "mk", "no", "pl", "pt", "ro", "ru", "sr", "sk", "es",
                            "sw", "sv", "ta", "th", "tr", "vi", "cy"]; // YES
            if (voiceArr.indexOf(language_id) > -1) return false;
            return true;
        }),
        forwardDisabled: WinJS.Binding.converter(function (str) {
            if (str.trim().length > 0) return false;
            return true;
        }),
    });

})();
