(function () {
    "use strict";

    var app = WinJS.Application;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    function translateByGoogle (inputLang, outputLang, inputText) {
        return WinJS.Promise.as().then(function () {
            if (encodeURIComponent(inputText).length > 1000) {
                return WinJS.Promise.as().then(function () {
                    var tmp = inputText.substr(0, 100);
                    for (var i = 200; i < inputText.length; i = i + 100) {
                        if (encodeURIComponent(inputText.substr(0, i)).length > 1000) {
                            break;
                        }
                        tmp = inputText.substr(0, i);
                    }

                    var last = tmp.lastIndexOf(" ");
                    if (last == -1) last = tmp.length - 1;
                    var ltext = tmp.substr(0, last);
                    var rtext = inputText.substr(last + 1, inputText.length - ltext.length);

                    var lres, rres;
                    var promises = [];
                    promises.push(Custom.Translate.translateByGoogle(inputLang, outputLang, ltext).then(function (result) {
                        lres = result;
                    }));

                    promises.push(Custom.Translate.translateByGoogle(inputLang, outputLang, rtext).then(function (result) {
                        rres = result;
                    }));

                    return WinJS.Promise.join(promises).then(function () {
                        if ((!lres) || (!rres)) return;
                        return {
                            inputLang: lres.inputLang,
                            suggestedinputLang: lres.outputLang,
                            inputText: lres.inputText + rres.inputText,
                            suggestedinputText: null,
                            inputRoman: lres.inputRoman + rres.inputRoman,
                            inputDict: "",

                            outputLang: outputLang,
                            outputText: lres.outputText + rres.outputText,
                            outputRoman: lres.outputRoman + rres.outputRoman,
                            outputDict: "",
                            source: "google"
                        }
                    });

                });
            }
            else {
                var url = encodeURI(Custom.Utils.getDomain() + "/translate_a/single?client=t&sl=" + inputLang + "&tl=" + outputLang + "&hl=en&dt=bd&dt=ex&dt=ld&dt=md&dt=qc&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&prev=btn&ssel=4&tsel=4&tk=0&q=" + inputText)
                return WinJS.xhr({
                    type: "get",
                    url: url,
                    responseType: "json"
                }).then(function (response) {

                    var raw = response.response;
                    raw = Custom.Utils.standardlizeJSON(raw);
                    var result = JSON.parse(raw);

                    var outputText = "";
                    var inputRoman = "";
                    var outputRoman = "";
                    if (result[0]) {
                        result[0].forEach(function (part) {
                            if (part[0]) outputText += part[0];
                            if (!part[0]) {
                                if (part[2]) outputRoman += part[2];
                                if (part[3]) inputRoman += part[3];
                            }
                        });
                    }

                    var inputLang = result[2];
                    if (inputLang == 'zh-CN') inputLang = 'zh';
                    var inputDict;
                    if ((result[11]) || (result[12]) || (result[13]) || (result[14]))
                        inputDict = [result[11], result[12], result[13], result[14]];

                    var inputDict = inputDict;
                    var outputDict = result[1];

                    var suggestedinputLang;
                    if (result[8]) {
                        suggestedinputLang = result[8][0][0];
                    }
                    if (suggestedinputLang == 'zh-CN') suggestedinputLang = 'zh';

                    var suggestedinputText;
                    if (result[7]) {
                        suggestedinputText = result[7][1];
                    }


                    return {
                        inputLang: inputLang,
                        suggestedinputLang: suggestedinputLang,
                        inputText: inputText,
                        suggestedinputText: suggestedinputText,
                        inputRoman: inputRoman,
                        inputDict: inputDict ? JSON.stringify(inputDict) : "",

                        outputLang: outputLang,
                        outputText: outputText,
                        outputRoman: outputRoman,
                        outputDict: outputDict ? JSON.stringify(outputDict) : "",
                        source: "google"
                    }

                });
            }
        });
    }

    function translateinBatchByGoogle(inputLang, outputLang, inputArr) {
        var url = Custom.Utils.getDomain() + "/translate_a/t?client=mt&sl=" + inputLang + "&tl=" + outputLang + "&hl=en&v=1.0&tk=0";

        var nextArr = [];

        for (var i = 0; i < inputArr.length; i++) {
            if (encodeURI(url + "&q" + inputArr[i]).length > 2000) {
                nextArr = inputArr.slice(i, inputArr.length);
                break;
            }
            else {
                url += "&q=";
                url += inputArr[i];
            }
        }
        url = encodeURI(url);


        return WinJS.xhr({
            type: "get",
            url: url,
            responseType: "json"
        }).then(function (response) {
            return JSON.parse(response.response);
        });
    }

    function translateByBing(inputLang, outputLang, inputText) {

        return WinJS.Promise.as().then(function () {
            if (app.sessionState.bingAppId)
                return app.sessionState.bingAppId;
            var url = "http://www.bing.com/translator/dynamic/213366/js/LandingPage.js";
            return WinJS.xhr({
                type: "get",
                url: url,
            }).then(function (response) {
                app.sessionState.bingAppId = response.response.substr(response.response.indexOf("appId:") + 6, 47);
                return app.sessionState.bingAppId;
            });
        }).then(function (appId) {
            var tmpinputLang = inputLang;
            if (tmpinputLang == "auto")
                tmpinputLang = "";
            else if (tmpinputLang == "zh")
                tmpinputLang = "zh-CHS";
            else if (tmpinputLang == "zh-TW")
                tmpinputLang = "zh-CHT";

            var tmpoutputLang = outputLang;
            if (tmpoutputLang == "zh")
                tmpoutputLang = "zh-CHS";
            else if (tmpoutputLang == "zh-TW")
                tmpoutputLang = "zh-CHT";

            var texts = inputText.split("\n");
            var url = encodeURI("http://api.microsofttranslator.com/v2/ajax.svc/TranslateArray2?appId=" + appId + "&texts=" + JSON.stringify(texts) + "&from=" + tmpinputLang + "&to=" + tmpoutputLang + "&options={}");
            return WinJS.xhr({
                type: "get",
                url: url,
                responseType: "json"
            }).then(function (response) {
                var result = JSON.parse(response.response);
                if (typeof result != "object") {
                    app.sessionState.bingAppId = null;
                    throw "appid_expired";
                }

                if (inputLang == "auto") {
                    inputLang = result[0].From;
                    if (inputLang == "zh-CHS")
                        inputLang = "zh";
                    else if (inputLang == "zh-CHT")
                        inputLang = "zh-TW";
                }

                var outputText = "";
                result.forEach(function (x) {
                    outputText += x.TranslatedText + "\n";
                });

                return {
                    inputLang: inputLang,
                    suggestedinputLang: null,
                    inputText: inputText,
                    suggestedinputText: null,
                    inputRoman: "",
                    inputDict: "",

                    outputLang: outputLang,
                    outputText: outputText,
                    outputRoman: "",
                    outputDict: "",
                    source: "bing"
                };
            });
        }).then(function (data) {
            if (inputText.indexOf(" ") > -1)
                return data;
            var url = encodeURI("http://www.microsofttranslator.com/dictionary.ashx?from=" + inputLang + "&to=" + outputLang + "&text=" + inputText);
            return WinJS.xhr({
                type: "get",
                url: url,
                responseType: "json"
            }).then(function (response) {
                if (response.response.length <= 25)
                    return data;
                data.outputDict = response.response.substring(21, response.response.length - 4);
                return data;
            }, function (err) {
                return data;
            })
        });
    }

    function translateinBatchByBing(inputLang, outputLang, inputArr) {

        return WinJS.Promise.as().then(function () {
            if (app.sessionState.bingAppId)
                return app.sessionState.bingAppId;
            var url = "http://www.bing.com/translator/dynamic/0/js/LandingPage.js";
            return WinJS.xhr({
                type: "get",
                url: url,
            }).then(function (response) {
                app.sessionState.bingAppId = response.response.substr(459, 47);
                return app.sessionState.bingAppId;
            });
        }).then(function (appId) {
            if (inputLang == "auto")
                inputLang = "";
            else if (inputLang == "zh")
                inputLang = "zh-CHS";
            else if (inputLang == "zh-TW")
                inputLang = "zh-CHT";
            var inputTexts = JSON.stringify(inputArr);
            var url = encodeURI("http://api.microsofttranslator.com/v2/ajax.svc/TranslateArray2?appId=" + appId + "&texts=" + inputTexts + "&from=" + inputLang + "&to=" + outputLang + "&options={}");
            return WinJS.xhr({
                type: "get",
                url: url,
                responseType: "json"
            }).then(function (response) {
                var result = JSON.parse(response.response);
                if (typeof result != "object") {
                    app.sessionState.bingAppId = null;
                    throw "appid_expired";
                }
                var arr = [];
                result.forEach(function (x) {
                    arr.push(x.TranslatedText);
                });
                return arr;
            });
        });
    }

    var supportedbyBing = ["auto", "he", "pl", "ar", "hi", "pt", "bg", "ca", "hu", "ro", "zh", "id",
                            "ru", "zh-TW", "it", "sk", "cs", "ja", "sl", "da", "es", "nl", "sv", "en",
                            "ko", "th", "et", "lv", "tr", "fi", "lt", "uk", "fr", "ms", "ur", "de", "mt",
                            "vi", "el", "no", "cy", "ht", "fa", "tlh", "otq", "yua"];

    function translate(inputLang, outputLang, inputText) {
        return WinJS.Promise.as().then(function () {
            if (inputText.length < 1) return;

            if (["tlh", "otq", "yua"].indexOf(inputLang) > -1) {
                if (supportedbyBing.indexOf(outputLang) > -1)
                    return Custom.Translate.translateByBing(inputLang, outputLang, inputText);

                return Custom.Translate.translateByBing(inputLang, "en", inputText).then(function (result) {
                    return Custom.Translate.translateByGoogle("en", outputLang, result.outputText);
                });
            }

            if (["tlh", "otq", "yua"].indexOf(outputLang) > -1) {
                if (supportedbyBing.indexOf(inputLang) > -1)
                    return Custom.Translate.translateByBing(inputLang, outputLang, inputText);

                return Custom.Translate.translateByGoogle(inputLang, "en", inputText).then(function (result) {
                    return Custom.Translate.translateByBing("en", outputLang, result.outputText);
                });
            }

            if ((localSettings.values["bing"] == true) && (supportedbyBing.indexOf(inputLang) > -1) && (supportedbyBing.indexOf(outputLang) > -1))
                return Custom.Translate.translateByBing(inputLang, outputLang, inputText);

            return Custom.Translate.translateByGoogle(inputLang, outputLang, inputText);
        }).then(null, function (err) {});
    }

    function translateinBatch(inputLang, outputLang, inputArr) {
        return WinJS.Promise.as().then(function () {

            if (["tlh", "otq", "yua"].indexOf(inputLang) > -1) {
                if (supportedbyBing.indexOf(outputLang) > -1)
                    return Custom.Translate.translateinBatchByBing(inputLang, outputLang, inputArr);

                return Custom.Translate.translateinBatchByBing(inputLang, "en", inputArr).then(function (result) {
                    return Custom.Translate.translateinBatchByGoogle("en", outputLang, result);
                });
            }

            if (["tlh", "otq", "yua"].indexOf(outputLang) > -1) {
                if (supportedbyBing.indexOf(inputLang) > -1)
                    return Custom.Translate.translateinBatchByBing(inputLang, outputLang, inputArr);

                return Custom.Translate.translateinBatchByGoogle(inputLang, "en", inputArr).then(function (result) {
                    return Custom.Translate.translateinBatchByBing("en", outputLang, result.outputText);
                });
            }

            if ((localSettings.values["bing"] == true) && (supportedbyBing.indexOf(inputLang) > -1) && (supportedbyBing.indexOf(outputLang) > -1))
                return Custom.Translate.translateinBatchByBing(inputLang, outputLang, inputArr);

            return Custom.Translate.translateinBatchByGoogle(inputLang, outputLang, inputArr);
        }).then(null, function (err) {});
    }

    WinJS.Namespace.define("Custom.Translate", {
        translateByGoogle: translateByGoogle,
        translateinBatchByGoogle: translateinBatchByGoogle,
        translateByBing: translateByBing,
        translateinBatchByBing: translateinBatchByBing,
        translate: translate,
        translateinBatch: translateinBatch
    });

})();
