(function () {
    "use strict";

    var utils = WinJS.Utilities;
    var binding = WinJS.Binding;
    var ui = WinJS.UI;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var roamingSettings = applicationData.roamingSettings;
    
    var livePromise;

    ui.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
    
            var that = this;

            this.liveCardTemplate = element.querySelector(".live-card-template").winControl;
            this.normalCardTemplate = element.querySelector(".normal-card-template").winControl;
            this.progressHistory = element.querySelector(".history-footer .progress");
            this.progressFavorites = element.querySelector(".favorites-footer .progress");
            this.dtInputLang = element.querySelector("#dt-input-lang");
            this.imeContainer = element.querySelector(".ime-container");
            this.backDrop = element.querySelector(".backdrop");
            this.selectLanguage = element.querySelector(".select-language");
            this.inputBox = element.querySelector("#input-box");
            this.pivotView = element.querySelector("#pivot").winControl;
            this.toolBar = element.querySelector(".toolbar").winControl;

            if (roamingSettings.values["prevent-lock"] == true) {
                if (window.dispRequest == null) {
                    window.dispRequest = new Windows.System.Display.DisplayRequest;
                    window.dispRequest.requestActive();
                }
            }

            var runningHistory = false;
            var runningFavorites = false;

            this.bindingData = binding.as({
                labelClearHistory: WinJS.Resources.getString("clear_history").value,
                selectMode: "hidden",
                imeMode: "",
                inputLang: (typeof localSettings.values["inputLang"] == "undefined") ? "en": localSettings.values["inputLang"],
                tmpinputLang: localSettings.values["inputLang"],
                outputLang: (typeof localSettings.values["outputLang"] == "undefined") ? "es" : localSettings.values["outputLang"],
                inputText: app.sessionState.inputText ? app.sessionState.inputText : "",
                expandinputBox: false,
                isPremium: Custom.Utils.isPremium(),
                languageTemplate: binding.initializer(function (itemPromise) {
                    return itemPromise.then(function (item) {
                        var div = document.createElement("div");
                        div.className = "language-item material-text";
                        div.innerText = (item.data.language_name) ? item.data.language_name
                                            : WinJS.Resources.getString(item.data.language_id).value;
                        return div;
                    });
                }),
                languageGroupTemplate: binding.initializer(function (itemPromise) {
                    return itemPromise.then(function (item) {
                        var div = document.createElement("div");
                        div.className = "language-group material-text themed-text";
                        if (item.data.main == 1)
                            div.innerText = WinJS.Resources.getString("all").value;
                        else {
                            div.innerText = WinJS.Resources.getString("recent").value;
                            div.style.marginTop = "10px";
                        }
                        return div;
                    });
                }),
                languageInvoked: binding.initializer(function (e) {
                    that.hideDropdown();
                    var index = e.detail.itemIndex;
                    var newLang = Custom.Data.groupedlanguageList.getAt(index).language_id;
                    if (that.bindingData.selectMode == "inputLang") {
                        if ((that.bindingData.inputLang != "auto") && (newLang == that.bindingData.outputLang))
                            that.swapLanguage();
                        else
                            that.bindingData.inputLang = newLang;
                    }
                    if (that.bindingData.selectMode == "outputLang") {
                        if (newLang == that.bindingData.inputLang) 
                            that.swapLanguage();
                        else
                            that.bindingData.outputLang = newLang;
                    }
                }),
                cardTemplate: binding.initializer(function (itemPromise) {
                    return itemPromise.then(function (item) {
                        if (item.data.type === "live")
                            return that.liveCardTemplate.renderItem(itemPromise);
                        return that.normalCardTemplate.renderItem(itemPromise);
                    });
                }),
                cardLayout: {
                    type: WinJS.Class.define(function (options) {
                            this._site = null;
                            this._surface = null;
                          },
                          {
                            initialize: function (site) {
                                this._site = site;
                                this._surface = this._site.surface;

                                WinJS.Utilities.addClass(this._surface, "card-layout");

                                return WinJS.UI.Orientation.vertical;
                            },

                            uninitialize: function () {
                                WinJS.Utilities.removeClass(this._surface, "card-layout");
                                this._site = null;
                                this._surface = null;
                            },
                          })
                },
                historyList: new WinJS.Binding.List([]),
                loadmoreHistory: binding.initializer(function (e) {
                    var visible = (e) ? e.detail.visible : true;
                    if (visible) {
                        return WinJS.Promise.as().then(function () {
                            if (runningHistory) return;
                            runningHistory = true;
                            utils.removeClass(that.progressHistory, "hide");

                            var statement = "SELECT * FROM history ORDER BY id DESC LIMIT 0,5";
                            if (that.bindingData.historyList.length > 0) {
                                var lastData = that.bindingData.historyList.getAt(that.bindingData.historyList.length - 1);
                                if (lastData.type != "live")
                                    statement = "SELECT * FROM history WHERE id < " + lastData.id + " ORDER BY id DESC LIMIT 0,5";
                            }
                            
                            return Custom.SQLite.localDatabase.executeAsync(statement)
                                .then(function (result) {
                                    result.forEach(function (x) {
                                        var item = Custom.SQLite.entriestoObj(x.entries);
                                        that.bindingData.historyList.push(item);
                                    });
                                    runningHistory = false;
                                });
                        }).then(function () {
                            utils.addClass(that.progressHistory, "hide");
                        });
                    }
                    else {
                        utils.addClass(that.progressHistory, "hide");
                    }
                }),
                favoriteList: new WinJS.Binding.List([]),
                loadmoreFavorite: binding.initializer(function (e) {
                    var visible = (e) ? e.detail.visible: true;
                    if (visible) {
                        return WinJS.Promise.as().then(function () {
                            if (runningFavorites) return;
                            runningFavorites = true;
                            utils.removeClass(that.progressFavorites, "hide");
                            var maxId = "9223372036854775807";
                            if (that.bindingData.favoriteList.length > 0) {
                                maxId = that.bindingData.favoriteList.getAt(that.bindingData.favoriteList.length - 1).id;
                            }
                            var statement = "SELECT * FROM favorites WHERE id < " + maxId + " ORDER BY id DESC LIMIT 0,5";
                            return Custom.SQLite.localDatabase.executeAsync(statement)
                                .then(function (result) {
                                    result.forEach(function (x) {
                                        var item = Custom.SQLite.entriestoObj(x.entries);
                                        that.bindingData.favoriteList.push(item);
                                    });
                                    runningFavorites = false;
                                });
                        }).then(function () {
                            utils.addClass(that.progressFavorites, "hide");
                        });
                    }
                    else {
                        utils.addClass(that.progressFavorites, "hide");
                    }
                }),
                onclickinputLang: binding.initializer(function (e) {
                    that.bindingData.imeMode = "";
                    if (that.bindingData.selectMode == "inputLang")
                        that.bindingData.selectMode = "hidden";
                    else
                        that.bindingData.selectMode = "inputLang";
                }),
                onclickoutputLang: binding.initializer(function (e) {
                    that.bindingData.imeMode = "";
                    if (that.bindingData.selectMode == "outputLang")
                        that.bindingData.selectMode = "hidden";
                    else
                        that.bindingData.selectMode = "outputLang";
                }),
                onclickbackDrop: binding.initializer(function () {
                    that.bindingData.selectMode = "hidden";
                }),
                onclickSwap: binding.initializer(function (e) {
                    that.swapLanguage();
                }),
                oninputText: binding.initializer(function (e) {
                    that.bindingData.inputText = that.inputBox.value;
                }),
                onkeydownText: (roamingSettings.values["enter-to-translate"] == false) ? null :
                    binding.initializer(function (e) {
                    if ((e.keyCode || e.which) == 13) {
                        that.inputBox.blur();
                        e.preventDefault();
                        that.addTranslation();
                    }
                }),
                onclickClearHistory: binding.initializer(function (e) {
                    if (that.bindingData.historyList.length > 0) {
                        Custom.Utils.showNotif(WinJS.Resources.getString("clearing_history").value);
                        var start = 0;
                        if (that.bindingData.historyList.getAt(0).type == "live") start = 1;
                        that.bindingData.historyList.splice(start, that.bindingData.historyList.length);
                        var statement = "DELETE FROM history";
                        Custom.SQLite.localDatabase.executeAsync(statement).then(function () {
                            Custom.Utils.hideNotif();
                        });
                    }
                }),
                onclickAbout: binding.initializer(function (e) {
                    nav.navigate("/pages/about/about.html");
                }),
                onclickSettings: binding.initializer(function (e) {
                    nav.navigate("/pages/settings/settings.html");
                }),
                onclickPin: binding.initializer(function (e) {
                    nav.navigate("/pages/p-pin/p-pin.html");
                }),
                onclickBuyNow: binding.initializer(function (e) {
                    nav.navigate("/pages/premium/premium.html");
                }),
                onclickClear: binding.initializer(function (e) {
                    that.bindingData.inputText = "";
                }),
                onclickWrite: binding.initializer(function (e) {
                    that.bindingData.imeMode = (that.bindingData.imeMode != "write") ? "write" : "";
                    if (that.bindingData.imeMode != "")
                        that.bindingData.expandinputBox = false;
                }),
                onclickSpeak: binding.initializer(function (e) {
                    if (utils.hasClass(this, "disabled")) {
                        Custom.Utils.popupMsg(WinJS.Resources.getString("sorry").value,
                                              WinJS.Resources.getString("speech_not_available").value
                                                .replace("{1}", WinJS.Resources.getString(that.bindingData.inputLang).value));
                        return;
                    }
                    that.bindingData.imeMode = (that.bindingData.imeMode != "speak") ? "speak" : "";
                    if (that.bindingData.imeMode != "")
                        that.bindingData.expandinputBox = false;
                }),
                onclickCamera: binding.initializer(function (e) {
                    if (utils.hasClass(this, "disabled")) {
                        Custom.Utils.popupMsg(WinJS.Resources.getString("sorry").value,
                                              WinJS.Resources.getString("camera_not_available").value
                                                .replace("{1}", WinJS.Resources.getString(that.bindingData.inputLang).value));
                        return;
                    }
                    var picker = new Windows.Storage.Pickers.FileOpenPicker();
                    picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                    picker.fileTypeFilter.append(".jpg");
                    picker.fileTypeFilter.append(".jpeg");
                    picker.fileTypeFilter.append(".png");

                    if (Custom.Device.isPhone == true)
                        picker.pickSingleFileAndContinue();
                    else {
                        var menu = element.querySelector("#cameraMenu").winControl;
                        menu.show(this, "bottom");
                    }
                }),
                onclickForward: binding.initializer(function (e) {
                    that.addTranslation();
                }),
                onselectionchangedpivotView: binding.initializer(function (e) {
                    var item = e.detail.item;
                    if (that.pivotView.selectedIndex == 1) {
                        that.bindingData.historyList.splice(0, that.bindingData.historyList.length);
                        that.bindingData.loadmoreFavorite().then(function () {
                            if (that.bindingData.favoriteList.length == 0) {
                                item.element.querySelector(".empty").style.display = "";
                                item.element.querySelector("#favorite-list").style.display = "none";
                            }
                            else {
                                item.element.querySelector(".empty").style.display = "none";
                                item.element.querySelector("#favorite-list").style.display = "";
                            }
                        });
                    }
                    else if (that.pivotView.selectedIndex == 0) {
                        that.bindingData.favoriteList.splice(0, that.bindingData.favoriteList.length);
                        that.bindingData.loadmoreHistory();
                    }
                }),
                onclickExpand: binding.initializer(function (e) {
                    that.bindingData.expandinputBox = !that.bindingData.expandinputBox;
                    that.bindingData.imeMode = "";
                }),
                onclickOutside: binding.initializer(function (e) {
                    that.bindingData.imeMode = "";
                }),
                onclickOpenCamera: binding.initializer(function () {
                    var dialog = new Windows.Media.Capture.CameraCaptureUI();
                    return dialog.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (file) {
                        if (file)
                            nav.navigate("/pages/p-camera/p-camera.html", { file: file });
                    });
                }),
                onclickOpenGallery: binding.initializer(function () {
                    var picker = new Windows.Storage.Pickers.FileOpenPicker();
                    picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                    picker.fileTypeFilter.append(".jpg");
                    picker.fileTypeFilter.append(".jpeg");
                    picker.fileTypeFilter.append(".png");
                    picker.pickSingleFileAsync().done(function (file) {
                        if (file)
                            nav.navigate("/pages/p-camera/p-camera.html", { file: file });
                    });
                })
            });
           
            binding.processAll(element, this.bindingData);
            binding.bind(this.bindingData, {
                inputLang: function(value) {
                    localSettings.values["inputLang"] = value;
                    that.bindingData.tmpinputLang = value;
                    if (value != "auto") that.updateRecent();
                    that.liveTranslation();
                },
                outputLang: function (value) {
                    localSettings.values["outputLang"] = value;
                    that.updateRecent();
                    that.liveTranslation();
                },
                selectMode: function (value) {
                    if (value == "hidden")
                        that.hideDropdown();
                    else
                        that.showDropdown(that.bindingData.selectMode);
                },
                imeMode: function (value) {
                    if (that.imeControl) {
                        that.imeControl.dispose();
                        that.imeControl = null;
                    }
                    that.imeContainer.className = "ime-container";
                    that.imeContainer.innerHTML = "";
                    that.applyText();

                    if (value != "") {
                        if (value == "write")
                            that.imeControl = new Custom.Control.Write(that.imeContainer);
                        if (value == "speak")
                            that.imeControl = new Custom.Control.Speak(that.imeContainer);

                        that.imeControl.onedit = function (e) {
                            if (e.eType == 0)
                                that.addText(e.eText);
                            else if (e.eType == 1)
                                that.deleteText();
                            else if (e.eType == 2) 
                                that.applyText(); 
                        }
                    }
                },
                inputText: function (value) {
                    if (that.inputBox.value != value)
                        that.inputBox.value = value;
                    app.sessionState.inputText = value;
                    that.liveTranslation();
                },
                expandinputBox: function (value, old_value) {
                    if (old_value == true)
                        that.pivotView.selectedItem.element.style.transform = "translate(-" + that.pivotView.selectedItem.element.style.left + ", 0px)";
                }
            });

            // Preview Bug fixes
            this.toolBar.forceLayout();
            
        },

        unload: function (element, options) {
            if (window.soundPromise)
                window.soundPromise.cancel();
            if (window.dispRequest != null) {
                window.dispRequest.requestRelease();
                window.dispRequest = null;
            }
        },

        updateLayout: function (element, options) {
            this.bindingData.imeMode = "";
        },

        deleteText: function() {
            var new_text = this.inputBox.querySelector(".new-text");
            if (new_text) {
                new_text.innerText = "";
                new_text.className = "";
            }
            else {
                var oldText = this.inputBox.value;
                if (oldText.length > 0)
                    this.bindingData.inputText = oldText.substr(0, oldText.length - 1);
            }
        },

        addText: function(text) {
            var new_text = this.inputBox.querySelector(".new-text");
            if (new_text) {
                new_text.innerText = text;
            }
            else {
                new_text = document.createElement("span");
                new_text.innerText = text;
                new_text.className = "new-text";
                this.inputBox.appendChild(new_text);
            }
        },

        applyText: function() {
            var new_text = this.inputBox.querySelector(".new-text");
            if (new_text) {
                new_text.className = "";
                this.bindingData.inputText = this.inputBox.value;
            }
        },

        hideDropdown: function () {
            var element = this.element;
            utils.removeClass(this.backDrop, "show");
            utils.removeClass(this.selectLanguage, "show");
        },

        showDropdown: function (type) {
            var element = this.element;
            var langlist = element.querySelector("#language-list").winControl;
            var auto_in_list = false;
            if (Custom.Data.languageList.getAt(0).language_id == "auto") auto_in_list = true;
            if (type == "inputLang") {
                if (auto_in_list == false) Custom.Data.languageList.unshift({
                    language_id: "auto",
                    main: 1
                });

                utils.removeClass(this.selectLanguage, "show-right");
                utils.addClass(this.selectLanguage, "show-left");
                utils.addClass(this.selectLanguage, "show");
            }
            if (type == "outputLang") {
                if (auto_in_list == true) Custom.Data.languageList.shift();
                utils.removeClass(this.selectLanguage, "show-left");
                utils.addClass(this.selectLanguage, "show-right");
                utils.addClass(this.selectLanguage, "show");
            }
            utils.addClass(this.backDrop, "show");
        },

        swapLanguage: function () {
            if (this.bindingData.inputLang == "auto") return;

            var element = this.element;
            WinJS.Utilities.toggleClass(element.querySelector("#swap"), "rotate");
            var tmp = this.bindingData.outputLang;
            this.bindingData.outputLang = this.bindingData.inputLang;
            this.bindingData.inputLang = tmp;
        },

        addTranslation: function() {
            var that = this;
            if (livePromise)
                livePromise.cancel();
            return WinJS.Promise.as().then(function () {
                var inputLang = that.bindingData.inputLang;
                var outputLang = that.bindingData.outputLang;
                var inputText = that.bindingData.inputText;

                if (inputText.length < 1) return;

                return WinJS.Promise.as().then(function () {
                    Custom.Utils.showNotif(WinJS.Resources.getString("translating").value);
                    if (that.bindingData.historyList.length > 0) {
                        var tmp = that.bindingData.historyList.getAt(0);
                        if (tmp.type == "live") {
                            that.bindingData.historyList.splice(0, 1);
                            if ((tmp.inputText == inputText)
                            && (tmp.inputLang == inputLang)
                            && (tmp.outputLang == outputLang))
                                return tmp;
                        }
                    }
                    return Custom.Translate.translate(inputLang, outputLang, inputText);
                }).then(function (data) {
                    Custom.Utils.hideNotif();
                    if (data) {
                        delete data.type;
                        delete data.suggestedinputLang;
                        delete data.suggestedinputText;
                        return Custom.SQLite.insertObject(Custom.SQLite.localDatabase, "history", data).then(function (res) {
                            that.bindingData.inputText = "";
                            res.type = "normal";
                            that.bindingData.historyList.unshift(res);
                            that.bindingData.expandinputBox = false;
                        });      
                    }
                    else {
                        return Custom.Utils.popupNoInternet();
                    }               
                });
            });
        },

        liveTranslation: function () {
            if (roamingSettings.values["realtime-translation"] == false) return;
            if (this.bindingData.expandinputBox == true) return;
            var that = this;
            if (livePromise)
                livePromise.cancel();
            livePromise = WinJS.Promise.as().then(function () {

                var inputLang = that.bindingData.inputLang;
                var outputLang = that.bindingData.outputLang;
                var inputText = that.bindingData.inputText;

                if (inputText.trim().length < 1) {
                    if ((that.bindingData.historyList.length > 0) && (that.bindingData.historyList.getAt(0).type == "live"))
                        that.bindingData.historyList.splice(0, 1);
                    if (inputLang == "auto")
                        that.bindingData.tmpinputLang = "auto";
                }
                else {
                    return Custom.Translate.translate(inputLang, outputLang, inputText)
                        .then(function (result) {
                            if (!result) {
                                if ((that.bindingData.historyList.length > 0) && (that.bindingData.historyList.getAt(0).type == "live"))
                                    that.bindingData.historyList.splice(0, 1);
                                return;
                            }
                            if (that.bindingData.inputText == inputText) {
                                if (inputLang == "auto")
                                    that.bindingData.tmpinputLang = result.inputLang;
                                var tmp = result;
                                result.type = "live";
                                result.id = null;
                                if ((that.bindingData.historyList.length > 0) && (that.bindingData.historyList.getAt(0).type == "live"))
                                    that.bindingData.historyList.splice(0, 1, result);
                                else 
                                    that.bindingData.historyList.unshift(result);
                            }
                        });
                }
            })
        },

        updateRecent: function () {
            var inputLang = this.bindingData.inputLang;
            var outputLang = this.bindingData.outputLang;
            var recent = localSettings.values["recent"];
            var recentArr = [];
            if (recent) recentArr = JSON.parse(recent);

            var l = Custom.Data.languageList.length - 1;
            while (Custom.Data.languageList.getAt(l).main == 0) {
                Custom.Data.languageList.pop();
                l--;
            }

            if ((recentArr.indexOf(inputLang) < 0) && (inputLang != "auto")) {
                recentArr.push(inputLang);
            }
            if (recentArr.indexOf(outputLang) < 0) {
                recentArr.push(outputLang);
            }

            recentArr.splice(0, recentArr.length - 3);

            recentArr.forEach(function (x) {
                Custom.Data.languageList.push({
                    language_id: x,
                    language_name: WinJS.Resources.getString(x).value,
                    main: 0
                })
            });

            localSettings.values["recent"] = JSON.stringify(recentArr);
        },
    });

})();