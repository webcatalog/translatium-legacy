(function () {
    "use strict";

    var binding = WinJS.Binding;
    var nav = WinJS.Navigation;
    var utils = WinJS.Utilities;
    var app = WinJS.Application;

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    WinJS.UI.Pages.define("/pages/p-dict/p-dict.html", {

        ready: function (element, options) {
            var that = this;
            this.bindingData = binding.as({
                pageTitle: options.title,
                onclickBack: binding.initializer(function () {
                    nav.back();
                }),
            });

            binding.processAll(element, that.bindingData);

            var dict;
            if (options.source == "google") {
                if (options.type == "inputDict")
                    dict = this.generateinputDictbyGoogle(JSON.parse(options.dict));
                else
                    dict = this.generateoutputDictbyGoogle(JSON.parse(options.dict));
            }
            else {
                dict = this.generateDictbyBing(options.dict);
            }
            element.querySelector(".material-content").appendChild(dict);
        },

        unload: function () {
        },

        generateDictbyBing: function(dictData) {
            dictData = decodeURIComponent(dictData);
            var dict = document.createElement("div");
            dict.className = "dict";

            var content = document.createElement("div");
            content.className = "bing-dict";
            content.innerHTML = dictData;
            dict.appendChild(content);

            return dict;
        },

        generateoutputDictbyGoogle: function (dictData) {
            var that = this;
            var dict_output = document.createElement("div");
            dict_output.className = "dict";
            var dict_title = document.createElement("div");
            dict_title.className = "title themed";
            dict_title.innerText = WinJS.Resources.getString("translations").value;
            dict_output.appendChild(dict_title);

            dictData.forEach(function (x) {
                var part = document.createElement("div");
                part.className = "part-container";

                var type = document.createElement("div");
                type.className = "type";
                type.innerText = "/ " + WinJS.Resources.getString(x[0]).value + " /";
                part.appendChild(type);

                x[2].forEach(function (y, i) {
                    var word_item = document.createElement("div");
                    word_item.className = "word-item";
                    var word = document.createElement("div");
                    word.className =  "word";

                    word.innerText = i + 1 + ". ";

                    // Prefix
                    if (y[4]) word.innerText += y[4] + " ";

                    // Word
                    var main_word = document.createElement("a");
                    main_word.className = "blue";
                    main_word.innerText = y[0];
                    main_word.onclick = function () {
                        that.translate(localSettings.values["outputLang"], localSettings.values["inputLang"], y[0]);
                    }
                    word.appendChild(main_word);

                    // Meanings
                    var meaning = document.createElement("div");
                    meaning.className = "meaning";
                    y[1].forEach(function (text, i) {

                        if (i > 0) {
                            var sepa = document.createElement("span");
                            sepa.innerText = ", ";
                            meaning.appendChild(sepa);
                        }

                        var am = document.createElement("a");
                        am.innerText = text;
                        am.onclick = function () {
                            that.translate(localSettings.values["inputLang"], localSettings.values["outputLang"], text);
                        }
                        meaning.appendChild(am);
                    });

                    word_item.appendChild(word);
                    word_item.appendChild(meaning);

                    part.appendChild(word_item);
                });

                dict_output.appendChild(part);
            });
            return dict_output;
        },

        generateinputDictbyGoogle: function (dictData) {
            var that = this;
            var dict_input = document.createElement("div");
            dict_input.className = "dict";
            // Definitions
            if (dictData[1]) {
                var title = document.createElement("div");
                title.className = "title themed";
                title.innerText = WinJS.Resources.getString("definitions").value;
                dict_input.appendChild(title);

                dictData[1].forEach(function (x) {
                    var part = document.createElement("div");
                    part.className = "part-container";

                    var type = document.createElement("div");
                    type.className = "type";
                    type.innerText = "/ " + WinJS.Resources.getString(x[0]).value + " /";
                    part.appendChild(type);

                    x[1].forEach(function (y, i) {
                        var word_item = document.createElement("div");
                        word_item.className = "word-item";
                        var word = document.createElement("div");
                        word.className = "word";

                        word.innerText = i + 1 + ". ";

                        // Word
                        var main_word = document.createElement("a");
                        main_word.className = "blue";
                        main_word.innerText = y[0];
                        main_word.onclick = function () {
                            that.translate(localSettings.values["inputLang"], localSettings.values["outputLang"], y[0]);
                        }
                        word.appendChild(main_word);
                        word_item.appendChild(word);

                        // Example
                        if (y[2]) {
                            var example = document.createElement("div");
                            example.className = "meaning";
                            var am = document.createElement("a");
                            am.innerText = '"' + y[2] + '"';
                            am.onclick = function () {
                                that.translate(localSettings.values["inputLang"], localSettings.values["outputLang"], y[2]);
                            }
                            example.appendChild(am);
                            word_item.appendChild(example);
                        }

                        part.appendChild(word_item);
                    });

                    dict_input.appendChild(part);
                });
            }

            // Synonyms
            if (dictData[0]) {
                var title = document.createElement("div");
                title.className = "title themed";
                title.innerText = WinJS.Resources.getString("synonyms").value;
                dict_input.appendChild(title);

                var part = document.createElement("div");
                part.className = "part-container";

                dictData[0].forEach(function (x) {
                    var type = document.createElement("div");
                    type.className = "type";
                    type.innerText = "/ " + x[0] + " /";

                    var ul = document.createElement("ul");
                    x[1].forEach(function (word_list) {
                        var li = document.createElement("li");
                        word_list[0].forEach(function (text, i) {
                            if (i > 0) {
                                var sepa = document.createElement("span");
                                sepa.innerText = ", ";
                                li.appendChild(sepa);
                            }

                            var am = document.createElement("a");
                            am.innerText = text;
                            am.onclick = function () {
                                that.translate(localSettings.values["inputLang"], localSettings.values["outputLang"], text);
                            }
                            li.appendChild(am);
                        })

                        ul.appendChild(li);
                    });
                    part.appendChild(type);
                    part.appendChild(ul);
                });

                dict_input.appendChild(part);
            }

            // Examples
            if (dictData[2]) {
                var title = document.createElement("div");
                title.className = "title themed";
                title.innerText = WinJS.Resources.getString("examples").value;
                dict_input.appendChild(title);

                var part = document.createElement("div");
                part.className = "part-container";

                dictData[2][0].forEach(function (x, i) {
                    var word_item = document.createElement("div");
                    word_item.className = "word-item";
                    var word = document.createElement("div");
                    word.className = "word";

                    var span = document.createElement("span");
                    span.innerText = i + 1 + ". ";
                    word.appendChild(span);

                    var ax = document.createElement("a");
                    utils.setInnerHTML(ax, toStaticHTML(x[0]));
                    ax.onclick = function () {
                        that.translate(localSettings.values["inputLang"], localSettings.values["outputLang"], ax.innerText);
                    };
                    word.appendChild(ax);

                    word_item.appendChild(word);
                    part.appendChild(word_item);
                });

                dict_input.appendChild(part);
            }

            // See also
            if (dictData[3]) {
                var title = document.createElement("div");
                title.className = "title themed";
                title.innerText = WinJS.Resources.getString("see_also").value;
                dict_input.appendChild(title);

                var part = document.createElement("div");
                part.className = "part-container";

                dictData[3].forEach(function (x) {
                    var word_item = document.createElement("div");
                    word_item.className = "word-item";
                    var word = document.createElement("div");
                    word.className = "word";

                    x.forEach(function (y, i) {
                        if (i > 0) {
                            var sepa = document.createElement("span");
                            sepa.innerText = ", ";
                            word.appendChild(sepa);
                        }
                        var ax = document.createElement("a");
                        utils.setInnerHTML(ax, toStaticHTML(y));
                        ax.onclick = function () {
                            that.translate(localSettings.values["inputLang"], localSettings.values["outputLang"], ax.innerText);
                        };
                        word.appendChild(ax);
                    });

                    word_item.appendChild(word);
                    part.appendChild(word_item);
                });


                dict_input.appendChild(part);
            }
            return dict_input;
        },

        translate: function (inputLang, outputLang, inputText) {
            localSettings.values["inputLang"] = inputLang;
            localSettings.values["outputLang"] = outputLang;
            app.sessionState.inputText = inputText;
            nav.back();
        }
    });

})();
