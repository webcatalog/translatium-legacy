(function () {
    "use strict";

    var binding = WinJS.Binding;
    var nav = WinJS.Navigation;
    var app = WinJS.Application;

    var OCR = WindowsPreview.Media.Ocr;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var roamingSettings = applicationData.roamingSettings;

    WinJS.UI.Pages.define("/pages/p-camera/p-camera.html", {

        ready: function (element, options) {
            var that = this;

            this.previewImg = element.querySelector(".preview");
            this.ocrText = element.querySelector(".text-overlay");
            this.bgOverlay = element.querySelector(".bg-overlay");
            this.zoomContainer = element.querySelector(".zoom-container");

            this.previewImg.onload = function () {
                try {
                    that.zoomContainer.msContentZoomFactor = (window.screen.width / that.previewImg.width).toFixed(2);
                } catch(err) {}
            }

            nav.history.current.initialPlaceholder = true;

            this.bindingData = binding.as({
                inputLang: localSettings.values["inputLang"],
                outputLang: localSettings.values["outputLang"],
                imgSrc: window.URL.createObjectURL(options.file, { oneTimeOnly: true }),
                extractedText: "",
                onclickBack: binding.initializer(function () {
                    nav.back();
                }),
                onclickSelect: binding.initializer(function () {
                    var picker = new Windows.Storage.Pickers.FileOpenPicker();
                    picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                    picker.fileTypeFilter.append(".jpg");
                    picker.fileTypeFilter.append(".jpeg");
                    picker.fileTypeFilter.append(".png");

                    if (Custom.Device.isPhone == true)
                        picker.pickSingleFileAndContinue();
                    else {
                        var menu = element.querySelector("#cameraMenu").winControl;
                        menu.show(this, "top");
                    }
                }),
                onclickTextOnly: binding.initializer(function () {
                    app.sessionState.inputText = that.bindingData.extractedText;
                    nav.back();
                }),
                onclickOnImg: binding.initializer(function () {
                    var inputLang = localSettings.values["inputLang"];
                    var outputLang = localSettings.values["outputLang"];
                    var ratio = that.lineData.ratio;
                    var lineArr = that.lineData.arr;
                    var lineInfo = that.lineData.info;
                    Custom.Utils.showNotif(WinJS.Resources.getString("translating").value);
                    return Custom.Translate.translateinBatch(inputLang, outputLang, lineArr).then(function (trans) {
                        if (trans) {
                            var ocrText = element.querySelector(".text-overlay");
                            ocrText.innerHTML = "";
                            for (var l = 0; l < lineInfo.lines.length; l++) {
                                var line = lineInfo.lines[l];
                                var wordbox = document.createElement("div");
                                wordbox.textContent = trans[l];
                                wordbox.className = "result";
                                wordbox.style.top = Math.round((ratio * line.words[0].top)) + "px";
                                wordbox.style.left = Math.round(ratio * line.words[0].left) + "px";
                                wordbox.style.fontSize = Math.round(ratio * line.words[0].height) + "px";
                                ocrText.appendChild(wordbox);
                            };
                        }
                        else {
                            Custom.Utils.popupNoInternet();
                        }
                        Custom.Utils.hideNotif();
                    });
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
            this.loadImage(options.file);
        },

        loadImage: function (file) {
            var that = this;

            var ocrEngine = new OCR.OcrEngine(this.getOCRlang(localSettings.values["inputLang"]));

            var previewImg = this.previewImg;
            var ocrText = this.ocrText;
            var bgOverlay = this.bgOverlay;
            var zoomContainer = this.zoomContainer;

            var imgWidth = 0;
            var imgHeight = 0;

            Custom.Utils.showNotif(WinJS.Resources.getString("recognizing").value);

            return file.openAsync(Windows.Storage.FileAccessMode.read).then(function (stream) {
                var bitmapDecoder = Windows.Graphics.Imaging.BitmapDecoder;
                return bitmapDecoder.createAsync(stream);
            }).then(function (decoder) {
                imgWidth = decoder.pixelWidth;
                imgHeight = decoder.pixelHeight;

                bgOverlay.style.height = imgHeight + "px";
                bgOverlay.style.width = imgWidth + "px";
                ocrText.style.height = imgHeight + "px";
                ocrText.style.width = imgWidth + "px";

                var ratio = 1;
                if (imgHeight > 2600 || imgWidth > 2600) {
                    ratio = 2600 / Math.max(imgHeight, imgWidth);
                }

                if (imgHeight < 40 || imgWidth < 40) {
                    ratio = Math.min(imgHeight, imgWidth) / 40;
                }
                imgHeight = Math.floor(imgHeight * ratio);
                imgWidth = Math.floor(imgWidth * ratio);

                if (ratio == 1) return decoder.getPixelDataAsync();

                var bitmapTransform = new Windows.Graphics.Imaging.BitmapTransform();
                bitmapTransform.scaledHeight = imgHeight;
                bitmapTransform.scaledWidth = imgWidth;
     
                return decoder.getPixelDataAsync(
                    Windows.Graphics.Imaging.BitmapPixelFormat.unknown,
                    Windows.Graphics.Imaging.BitmapAlphaMode.premultiplied,
                    bitmapTransform,
                    Windows.Graphics.Imaging.ExifOrientationMode.ignoreExifOrientation,
                    Windows.Graphics.Imaging.ColorManagementMode.doNotColorManage
                );
            }).then(function (pixelProvider) {
                var buffer = pixelProvider.detachPixelData();
                return ocrEngine.recognizeAsync(imgHeight, imgWidth, buffer);

            }).then(function (result) {
                var extractedText = "";

                if (result.textAngle) {
                    previewImg.style.transform = "rotate(" + result.textAngle + "deg)";
                    bgOverlay.style.transform = "rotate(" + result.textAngle + "deg)";
                }
                else {
                    previewImg.style.transform = "rotate(0deg)";
                    bgOverlay.style.transform = "rotate(0deg)";
                }

                var ratio = previewImg.width / imgWidth;
                ocrText.innerHTML = "";

                if (result.lines != null) {
                    var lineArr = [];
                    for (var l = 0; l < result.lines.length; l++) {
                        var line = result.lines[l];
                        var curline = "";
                        for (var w = 0; w < line.words.length; w++) {
                            var word = line.words[w];
                            curline += word.text + " ";
                            extractedText += word.text + " ";
                        }
                        var wordbox = document.createElement("div");

                        wordbox.textContent = curline;
                        wordbox.className = "result";
                        wordbox.style.top = Math.round((ratio * line.words[0].top)) + "px";
                        wordbox.style.left = Math.round(ratio * line.words[0].left) + "px";
                        wordbox.style.fontSize = Math.round(ratio * line.words[0].height) + "px";
                        ocrText.appendChild(wordbox);
                        lineArr.push(curline.trim());
                        extractedText += "\n";
                    }
                }

                that.lineData = {
                    info: result,
                    arr: lineArr,
                    ratio: ratio
                };
                return extractedText;

            }).then(function (text) {
                if (text.length < 1) 
                    throw WinJS.Resources.getString("cannot_recognize").value;
                that.bindingData.extractedText = text;
                Custom.Utils.hideNotif();
            }).then(null, function (error) {
                Custom.Utils.popupMsg(WinJS.Resources.getString("sorry").value, error);
                Custom.Utils.hideNotif();
            });
        },

        getOCRlang: function (language_id) {
            var lang = WindowsPreview.Media.Ocr.OcrLanguage;
            switch (language_id) {
                case "en":
                    return lang.english;
                case "zh":
                    return lang.chineseSimplified;
                case "zh-TW":
                    return lang.chineseTraditional;
                case "ce":
                    return lang.czech;
                case "da":
                    return lang.danish;
                case "nl":
                    return lang.dutch;
                case "fi":
                    return lang.finnish;
                case "fr":
                    return lang.french;
                case "de":
                    return lang.german;
                case "el":
                    return lang.greek;
                case "hu":
                    return lang.hungarian;
                case "it":
                    return lang.italian;
                case "ja":
                    return lang.japanese;
                case "ko":
                    return lang.korean;
                case "no":
                    return lang.norwegian;
                case "pl":
                    return lang.polish;
                case "pt":
                    return lang.portuguese;
                case "ru":
                    return lang.russian;
                case "es":
                    return lang.spanish;
                case "sv":
                    return lang.swedish;
                case "tr":
                    return lang.turkish;
                default:
                    return 0;
            }
        }

    });
})();
