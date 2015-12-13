(function () {
    "use strict";

    var activation = Windows.ApplicationModel.Activation;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    var rcns = Windows.ApplicationModel.Resources.Core;

    WinJS.Binding.optimizeBindingReferences = true;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    app.onactivated = function (args) {
        var p = WinJS.Promise.as().then(function () {
            var currentAppLang = Windows.Globalization.ApplicationLanguages.languages[0];
            if ((currentAppLang == "zh-CN") && (typeof localSettings.values["chinese-server"] != 'undefined'))
                localSettings.values["chinese-server"] = true;
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
               if ((Custom.Device.isPhone)
               && (currentAppLang == "en-US")) {
                  var uri = new Windows.Foundation.Uri("ms-appx:///cortana.xml");
                  Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function (vcd) {
                      return Windows.Media.SpeechRecognition.VoiceCommandManager.installCommandSetsFromStorageFileAsync(vcd);
                  }).then(function () {
                      var phraseList = [];
                      Custom.Data.langArr.forEach(function (lang_id) {
                          phraseList.push(WinJS.Resources.getString(lang_id).value);
                      });
                      return Windows.Media.SpeechRecognition.VoiceCommandManager.installedCommandSets.lookup("ModernTranslator").setPhraseListAsync("outputLang", phraseList);
                  }).then(null, function (err) {});
              }
            }
            return Custom.UI.applyTheme().then(function () {
                return Custom.UI.applyStatusbar();
            }).then(function () {
                return Custom.SQLite.setupDatabase();
            });
        }).then(function () {

          if (localSettings.values["tile_fixed"] != true) {
            Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function(tiles) {
              tiles.forEach(function(tile) {
                tile.requestDeleteAsync()
              })
            }).then(function() {
              localSettings.values["tile_fixed"] = true;
            });
          }

            if (args.detail.kind == activation.ActivationKind.protocol) {
                var uriObj = args.detail.uri;
                nav.history = app.sessionState.history || {};
                nav.history.current.initialPlaceholder = true;
                ui.disableAnimations();
                return ui.processAll().then(function () {
                    Custom.Data.loadlanguageList();
                    if (uriObj.path == "translate") {
                        var params = new Windows.Foundation.WwwFormUrlDecoder(uriObj.query);
                        try {
                            var inputLang = params.getFirstValueByName("inputlang");
                            var outputLang = params.getFirstValueByName("outputlang");
                            var inputText = params.getFirstValueByName("inputtext");
                            if (inputLang && (Custom.Data.langArr.indexOf(inputLang) > -1) || (inputLang == "auto"))
                                localSettings.values["inputLang"] = inputLang;
                            if (outputLang && Custom.Data.langArr.indexOf(outputLang) > -1)
                                localSettings.values["outputLang"] = outputLang;
                            app.sessionState.inputText = inputText;
                        } catch (err) {}
                    }
                    return nav.navigate(nav.location || Custom.Navigation.navigator.home, nav.state);
                });
            }

            if (args.detail.kind === activation.ActivationKind.shareTarget) {
                var shareOperation = args.detail.shareOperation;
                if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
                    return shareOperation.data.getTextAsync().then(
                        function (text) {
                            nav.history = app.sessionState.history || {};
                            nav.history.current.initialPlaceholder = true;
                            ui.disableAnimations();
                            return ui.processAll().then(function () {
                                Custom.Data.loadlanguageList();
                                app.sessionState.inputText = text;
                                return nav.navigate(Custom.Navigation.navigator.home);
                            });
                        }, function (e) {
                            shareOperation.reportError();
                        }
                    );
                }
            }

            if (args.detail.kind === activation.ActivationKind.voiceCommand) {
                var speechRecognitionResult = args.detail.result;
                var type = speechRecognitionResult.rulePath[0];
                var inputText = speechRecognitionResult.semanticInterpretation.properties.inputText[0];
                var outputLangName = speechRecognitionResult.semanticInterpretation.properties.outputLang[0];

                var outputLang = "en";
                for (var i = 0; i < Custom.Data.langArr.length; i++) {
                    var lang_id = Custom.Data.langArr[i];
                    var lang_str = WinJS.Resources.getString(lang_id).value;
                    if (outputLangName == lang_str) {
                        outputLang = lang_id;
                        break;
                    }
                }

                nav.history = app.sessionState.history || {};
                nav.history.current.initialPlaceholder = true;
                ui.disableAnimations();
                return ui.processAll().then(function () {
                    Custom.Data.loadlanguageList();
                    localSettings.values["inputLang"] = "auto";
                    localSettings.values["outputLang"] = outputLang;
                    app.sessionState.inputText = inputText;
                    return nav.navigate(Custom.Navigation.navigator.home);
                });
            }

            if (args.detail.kind === activation.ActivationKind.pickFileContinuation) {
                ui.disableAnimations();
                return ui.processAll().then(function () {
                    if (args.detail.detail[0].files[0])
                        return nav.navigate("/pages/p-camera/p-camera.html", { file: args.detail.detail[0].files[0] });
                });
            }

            if (args.detail.kind === activation.ActivationKind.launch) {
                nav.history = app.sessionState.history || {};
                nav.history.current.initialPlaceholder = true;
                ui.disableAnimations();
                return ui.processAll().then(function () {
                    Custom.Data.loadlanguageList();
                    if (args.detail.arguments.substr(0,13) == "tile_shortcut") {
                      var lang = args.detail.arguments.substr(13, args.detail.arguments.length - 13).split("_");
                      localSettings.values["inputLang"] = lang[0];
                      localSettings.values["outputLang"] = lang[1];
                      app.sessionState.inputText = "";
                      return nav.navigate(Custom.Navigation.navigator.home);
                    }
                    return nav.navigate(nav.location || Custom.Navigation.navigator.home, nav.state);
                });
            }
        }).then(function () {
          if (Custom.Utils.isPremium() == true) return;
          var adControlEl = document.querySelector("#adControl");

          var style = {};
          if (Custom.Device.isPhone == true) {
            if (window.innerWidth >= 480) {
              style.width = 480;
              style.height = 80;
            }
            else {
              style.width = 320;
              style.height = 50;
            }
          }
          else {
            style.width = 728;
            style.height = 90;
          }

          var options = {
            keywords: ["translation", "translator", "translate", "dictionary", "education"]
          };
          if (Custom.Device.isPhone == true) {
            options.applicationId = "e388bbd2-5e9e-4562-9ef4-79751efbd4fb";
            options.adUnitId = "11561360";
          }
          else {
            options.applicationId = "6863e6e4-65fb-48f5-8c05-56ea1b22237a";
            options.adUnitId = "11561359";
          }

          adControlEl.style.height = style.height+"px";
          adControlEl.style.width = style.width+"px";
          var adControl = new MicrosoftNSJS.Advertising.AdControl(
            adControlEl, options
          );
        }).then(function() {
          return sched.requestDrain(sched.Priority.aboveNormal + 1);
        }).then(function () {
          ui.enableAnimations();
        });
        p.done();
        args.setPromise(p);
    }

    app.onbackclick = function (e) {
        if (nav.history.current.location == "/pages/home/home.html") {
            var pageControl = Custom.Navigation.navigator.pageControl;
            if (pageControl.bindingData.selectMode != "hidden") {
                pageControl.bindingData.selectMode = "hidden";
                return true;
            }
            if (pageControl.bindingData.imeMode != "") {
                pageControl.bindingData.imeMode = "";
                return true;
            }
            if (pageControl.bindingData.expandinputBox == true) {
                pageControl.bindingData.expandinputBox = false;
                return true;
            }
        }
    }

    app.oncheckpoint = function (args) {
        app.sessionState.history = nav.history;

        if (window.soundPromise)
            window.soundPromise.cancel();

        if (window.dispRequest != null) {
            window.dispRequest.requestRelease();
            window.dispRequest = null;
        }

        if (nav.history.current.location == "/pages/home/home.html") {
            var pageControl = Custom.Navigation.navigator.pageControl;
            if (pageControl.bindingData.imeMode != "")
                pageControl.bindingData.imeMode = "";
        }

        if (nav.history.current.location == "/pages/p-livecamera/p-livecamera.html") {
            var pageControl = Custom.Navigation.navigator.pageControl;
            pageControl.disposeCamera();
        }
    };

    app.start();

})();
