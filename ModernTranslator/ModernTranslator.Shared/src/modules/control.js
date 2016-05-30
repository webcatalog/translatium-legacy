(function () {
  "use strict";

  var utils = WinJS.Utilities;
  var nav = WinJS.Navigation;
  var app = WinJS.Application;
  var applicationData = Windows.Storage.ApplicationData.current;
  var localSettings = applicationData.localSettings;

  function b(a, b) {
    for (var d = 0; d < b.length - 2; d += 3) {
        var c = b.charAt(d + 2),
            c = "a" <= c ? c.charCodeAt(0) - 87 : Number(c),
            c = "+" == b.charAt(d + 1) ? a >>> c : a << c;
        a = "+" == b.charAt(d) ? a + c & 4294967295 : a ^ c
    }
    return a
  }

  function TL(tkk, a) {
      for (var e = tkk.split("."), h = Number(e[0]) || 0, g = [], d = 0, f = 0; f < a.length; f++) {
          var c = a.charCodeAt(f);
          128 > c ? g[d++] = c : (2048 > c ? g[d++] = c >> 6 | 192 : (55296 == (c & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (c = 65536 + ((c & 1023) << 10) + (a.charCodeAt(++f) & 1023), g[d++] = c >> 18 | 240, g[d++] = c >> 12 & 63 | 128) : g[d++] = c >> 12 | 224, g[d++] = c >> 6 & 63 | 128), g[d++] = c & 63 | 128)
      }
      a = h;
      for (d = 0; d < g.length; d++) a += g[d], a = b(a, "+-a^+6");
      a = b(a, "+-3^+b+-f");
      a ^= Number(e[1]) || 0;
      0 > a && (a = (a & 2147483647) + 2147483648);
      a %= 1E6;
      return a.toString() + "." + (a ^ h)
  }

  WinJS.Namespace.define("Custom.Control", {
    Theme_X: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        this.name = this.element.getAttribute("aria-name");
        this.hex = this.element.getAttribute("aria-hex");
        this.thex = this.element.getAttribute("aria-thex");

        this.element.className = "color-box left";
        this.element.style.backgroundColor = this.hex;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        if (this.name == localSettings.values["x-theme"]) {
          var active = document.createElement("i");
          active.className = "md md-done";
          active.style.color = this.thex;
          this.element.appendChild(active);
        }

        var sp = document.createElement("span");
        sp.innerText = this.name;
        sp.style.color = this.thex;
        this.element.appendChild(sp);

        this.element.onclick = this._changeThemeX.bind(this);

      }, {
        _changeThemeX: function () {
          if (this.name != localSettings.values["x-theme"]) {

            var newname = this.name;
            var oldname = localSettings.values["x-theme"];

            localSettings.values["x-theme"] = newname;
            Custom.UI.applyTheme();

            Custom.Data.themeXList.every(function (x, i) {
              if (x.name == oldname) {
                var tmp = Custom.Data.themeXList.getAt(i);
                Custom.Data.themeXList.splice(i, 1, tmp);
                return false;
              }
              return true;
            });

            Custom.Data.themeXList.every(function (x, i) {
              if (x.name == newname) {
                var tmp = Custom.Data.themeXList.getAt(i);
                Custom.Data.themeXList.splice(i, 1, tmp);
                return false;
              }
              return true;
            });
          }
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Theme_Y: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        this.name = this.element.getAttribute("aria-name");
        this.hex = this.element.getAttribute("aria-hex");

        this.element.className = "color-box left";
        this.element.style.backgroundColor = this.hex;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        if (this.name == localSettings.values["y-theme"]) {
          var active = document.createElement("i");
          active.className = "md md-done";
          this.element.appendChild(active);
        }

        this.element.onclick = this._changeThemeY.bind(this);

      }, {
        _changeThemeY: function () {
          if (this.name != localSettings.values["y-theme"]) {

            var newname = this.name;
            var oldname = localSettings.values["y-theme"];

            localSettings.values["y-theme"] = newname;
            Custom.UI.applyTheme();
            Custom.UI.applyStatusbar();

            Custom.Data.themeYList.every(function (x, i) {
              if (x.name == oldname) {
                var tmp = Custom.Data.themeYList.getAt(i);
                Custom.Data.themeYList.splice(i, 1, tmp);
                return false;
              }
              return true;
            });

            Custom.Data.themeYList.forEach(function (x, i) {
              if (x.name == newname) {
                var tmp = Custom.Data.themeYList.getAt(i);
                Custom.Data.themeYList.splice(i, 1, tmp);
                return false;
              }
              return true;
            });
          }
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Listen: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "md-volume-up");
        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.player = document.createElement("audio");

        this.element.onclick = this._handleClick.bind(this);

      }, {
        _playSound: function () {
          var that = this;
          return new WinJS.Promise(function (complete, error, progress) {
            that.player.play();
            that.player.onended = function () {
              complete();
            };
          });
        },

        getGoogleTkk: function() {
          if (sessionStorage.getItem("googleTkk") === null) {
            var url = "https://translate.google.com/m/translate";
            return WinJS.xhr({
              url: url,
              responseType: "text"
            }).then(function (response) {
                return response.response;
              })
              .then(function(body) {
                var startStr = 'campaign_tracker_id:\'1h\',tkk:';
                var endStr = ',enable_formality:false';
                var startI = body.indexOf(startStr) + startStr.length;
                var endI = body.indexOf(endStr);
                var tkkEval = body.substring(startI, endI);

                var x = eval(eval(tkkEval));
                sessionStorage.setItem("googleTkk", x);
                return sessionStorage.getItem("googleTkk");
              });
          }
          else {
            return WinJS.Promise.as(sessionStorage.getItem("googleTkk"));
          }
        },

        _loadPart: function (lang, text, idx, total) {
          var that = this;
          return WinJS.Promise.as().then(function () {
            Custom.Utils.showNotif(WinJS.Resources.getString("loading_sound").value);

            return that.getGoogleTkk()
              .then(function(tkk) {
                console.log(tkk);
                var url = encodeURI("https://translate.google.com/translate_tts?ie=UTF-8&tl=" + lang + "&q=" + text + "&textlen=" + text.length + "&idx=" + idx + " &total=" + total +"&client=t&prev=input&tk=" + TL(tkk, text));
                return WinJS.xhr({ url: url, responseType: "blob" })
              })
            .then(function (response) {
              return response.response;
            }).then(function (blob) {
              if (blob) {
                var url = URL.createObjectURL(blob, { oneTimeOnly: true });
                that.player.src = url;
                return that._playSound().then(function () {
                  return true;
                });
              }
              throw "fail to get blob";
            }).then(function (err) {
              return true;
            });
          });
        },

        _splitToParts: function (lang, text) {
          var that = this;
          return WinJS.Promise.as().then(function () {
            var strArr = []
            while (text.length > 0) {
              if (text.length > 100) {
                var tmp = text.substr(0, 99);
                var last = tmp.lastIndexOf(" ");
                if (last == -1) last = tmp.length - 1;
                var stext = tmp.substr(0, last);
              }
              else {
                var stext = text;
              }
              strArr.push(stext);
              text = text.substr(stext.length);
            }
            return strArr;
          }).then(function (strArr) {
            var i = 0;
            var cF = function() {
              return that._loadPart(lang, strArr[i], i, strArr.length).then(function (ok) {
                if ((ok == true) && (i < strArr.length - 1)) {
                  i++;
                  return cF();
                }
              });
            }

            return cF();
          });
        },

        _handleClick: function () {
          var that = this;
          var element = this.element;
          var lang = this.lang;
          var text = this.text;
          if (text.length == 0) return;


          if (utils.hasClass(element, "md-volume-up")) {
            utils.removeClass(element, "md-volume-up");
            utils.addClass(element, "md-stop");
            if (window.soundPromise)
            window.soundPromise.cancel();
            window.soundPromise = this._splitToParts(lang, text)
            .then(
              function () {
                utils.addClass(element, "md-volume-up");
                utils.removeClass(element, "md-stop");
                that.player.src = "";
                Custom.Utils.hideNotif();
              },
              function (err) {
                if (err.name != "Canceled")
                Custom.Utils.popupNoInternet();
                utils.addClass(element, "md-volume-up");
                utils.removeClass(element, "md-stop");
                that.player.src = "";
                Custom.Utils.hideNotif();
              }
            );
          }
          else {
            if (window.soundPromise)
            window.soundPromise.cancel();
          }
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Suggestion: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.element.onclick = this._useSuggestion.bind(this);
      },
      {
        suggestedinputText: {
          get: function() {
            return this._suggestedinputText;
          },
          set: function (value) {
            this._suggestedinputText = value;
            this._setup();
          }
        },

        _setup: function () {
          if (this.suggestedinputText) {
            this.element.innerHTML = toStaticHTML(WinJS.Resources.getString("did_you_mean").value
            .replace("{1}", "<span style='text-decoration: underline;'>" + this.suggestedinputText + "</span>"));
            this.element.hidden = false;
            return;
          }
          if ((this.suggestedinputLang) && (this.suggestedinputLang != this.inputLang)) {
            this.element.innerHTML = toStaticHTML(WinJS.Resources.getString("translate_from").value
            .replace("{1}", "<span style='text-decoration: underline;'>" + WinJS.Resources.getString(this.suggestedinputLang).value + "</span>"));
            this.element.hidden = false;
            return;
          }
          this.element.hidden = true;
        },

        _useSuggestion: function () {
          if (this.suggestedinputText) {
            Custom.Navigation.navigator.pageControl.inputBox.value = this.suggestedinputText;
            Custom.Navigation.navigator.pageControl.bindingData.inputText = this.suggestedinputText;
            return;
          }
          if (this.suggestedinputLang) {
            Custom.Navigation.navigator.pageControl.bindingData.inputLang = this.suggestedinputLang;
            return;
          }
        },

        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Delete: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.element.onclick = this._deleteHistory.bind(this);
      },
      {
        _deleteHistory: function (e) {
          var id = this.id;
          var statement = "DELETE FROM history WHERE id=" + id;
          Custom.SQLite.localDatabase.executeAsync(statement).then(function () {
            Custom.Navigation.navigator.pageControl.bindingData.historyList.every(function (x, i) {
              if (x.id == id) {
                Custom.Navigation.navigator.pageControl.bindingData.historyList.splice(i, 1);
                return false;
              }
              return true;
            });
            if (Custom.Navigation.navigator.pageControl.bindingData.historyList.length == 0)
            Custom.Navigation.navigator.pageControl.bindingData.loadmoreHistory();
          });
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Star_in_History: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.element.onclick = this._toggleFavorite.bind(this);
      }, {
        id: {
          get: function () { return this._id; },
          set: function (value) {
            this._id = value;
            if (!value) return;
            var element = this.element;
            var statement = "SELECT COUNT(1) FROM favorites WHERE history_id=" + value;
            Custom.SQLite.localDatabase.executeAsync(statement).then(function (result) {
              var count = result[0].getFirstValueByName("COUNT(1)");
              if (count == 0) {
                utils.removeClass(element, "md-star");
                utils.addClass(element, "md-star-outline");
              }
              else {
                utils.removeClass(element, "md-star-outline");
                utils.addClass(element, "md-star");
              }
            });
          }
        },
        _toggleFavorite: function (e) {
          var element = this.element;
          var id = this.id;
          if (utils.hasClass(element, "md-star-outline")) {
            utils.removeClass(element, "md-star-outline");
            utils.addClass(element, "md-star");
            return WinJS.Promise.as()
            .then(function () {
              var statement = "SELECT * FROM history WHERE id = " + id + " LIMIT 0,1";
              return Custom.SQLite.localDatabase.executeAsync(statement);
            }).then(function (result) {
              var data = Custom.SQLite.entriestoObj(result[0].entries);
              data.history_id = data.id;
              delete data.id;
              return Custom.SQLite.insertObject(Custom.SQLite.localDatabase, "favorites", data);
            });
          }
          else {
            utils.addClass(element, "md-star-outline");
            utils.removeClass(element, "md-star");
            return WinJS.Promise.as().then(function () {
              var statement = "DELETE FROM favorites WHERE history_id = " + id;
              return Custom.SQLite.localDatabase.executeAsync(statement);
            });
          }
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Star_in_Favorites: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "md-star");
        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.element.onclick = this._removeFavorite.bind(this);
      }, {
        _removeFavorite: function (e) {
          var element = this.element;
          var id = this.id;
          utils.addClass(element, "md-star-outline");
          utils.removeClass(element, "md-star");
          Custom.Navigation.navigator.pageControl.bindingData.favoriteList.every(function (x, i) {
            if (x.id == id) {
              Custom.Navigation.navigator.pageControl.bindingData.favoriteList.splice(i, 1);
              return false;
            }
            return true;
          });
          return WinJS.Promise.as().then(function () {
            var statement = "DELETE FROM favorites WHERE id = " + id;
            return Custom.SQLite.localDatabase.executeAsync(statement);
          });
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Copy: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.element.onclick = this._showOptions.bind(this);
      }, {
        _copyFunc: function (text) {
          if (Custom.Device.isPhone) {
            var uri = new Windows.Foundation.Uri("clipboard:Set?Text=" + encodeURIComponent(text));
            return Windows.System.Launcher.launchUriAsync(uri);
          }
          else {
            var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
            dataPackage.setText(text);
            Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
          }
        },

        _showOptions: function (e) {
          var that = this;
          var menu = new Windows.UI.Popups.PopupMenu();
          menu.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("original_text").value, function () { that._copyFunc(that.inputText); }));
          menu.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("translated_text").value, function () { that._copyFunc(that.outputText); }));
          menu.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("both").value, function () { that._copyFunc(that.inputText + "\r\n" + that.outputText); }));
          var zoomFactor = document.documentElement.msContentZoomFactor;
          menu.showAsync({
            x: (e.pageX - window.pageXOffset) * zoomFactor,
            y: (e.pageY - window.pageYOffset) * zoomFactor
          });
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Share: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.element.onclick = this._showOptions.bind(this);
      }, {
        _shareFunc: function (text) {
          var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
          dataTransferManager.ondatarequested = function (e) {
            var request = e.request;
            request.data.properties.title = "\0";
            request.data.properties.description = "\0";
            request.data.setText(text);
            dataTransferManager.ondatarequested = null;
          }
          Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
        },

        _showOptions: function (e) {
          var that = this;
          var menu = new Windows.UI.Popups.PopupMenu();
          menu.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("original_text").value, function () { that._shareFunc(that.inputText); }));
          menu.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("translated_text").value, function () { that._shareFunc(that.outputText); }));
          menu.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("both").value, function () { that._shareFunc(that.inputText + "\r\n" + that.outputText); }));
          var zoomFactor = document.documentElement.msContentZoomFactor;
          menu.showAsync({
            x: (e.pageX - window.pageXOffset) * zoomFactor,
            y: (e.pageY - window.pageYOffset) * zoomFactor
          });
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Zoom: WinJS.Class.define(
      function (element, options) {
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.element.onclick = this._showZoom.bind(this);
      }, {
        _showZoom: function () {
          nav.navigate("/pages/p-zoom/p-zoom.html", { text: this.text });
        },
        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.element.onclick = null;
        }
      }
    ),
    Write: WinJS.Class.define(
      function (element, options) {
        var that = this;
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "write-control");
        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.recogList = new WinJS.Binding.List([]);
        this.recog = document.createElement("div");
        this.recog.className = "recog-list";
        this.recogLv = new WinJS.UI.ListView(this.recog, {
          itemDataSource: this.recogList.dataSource,
          itemTemplate: utils.markSupportedForProcessing(function (itemPromise) {
            return itemPromise.then(function (item) {
              var div = document.createElement("div");
              utils.addClass(div, "suggest")
              div.innerText = item.data.text;
              return div;
            });
          }),
          oniteminvoked: utils.markSupportedForProcessing(function (e) {
            that.callEvent(0, that.recogList.getAt(e.detail.itemIndex).text);
            that.callEvent(2);
            that.clearAll();
          })
        });
        this.element.appendChild(this.recog);

        this.canvas = document.createElement("canvas");
        this.element.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.context.canvas.height = this.canvas.clientHeight;
        this.context.canvas.width = this.canvas.clientWidth;
        this.context.strokeStyle = "#fff";
        this.context.lineJoin = "round";
        this.context.lineWidth = 5;

        this.action = document.createElement("div");
        this.action.className = "action";

        this.backSpace = document.createElement("i");
        this.backSpace.className = "md md-backspace material-grid-col-1";
        this.backSpace.onclick = function (e) {
          that.clearAll();
          that.callEvent(1);
        }
        this.action.appendChild(this.backSpace);

        this.spaceBar = document.createElement("div");
        this.spaceBar.className = "space-bar material-grid-col-2";
        this.spaceBar.innerText = "space";
        this.spaceBar.onclick = function () {
          that.clearAll();
          that.callEvent(2);
          that.callEvent(0, " ");
          that.callEvent(2);
        }
        this.action.appendChild(this.spaceBar);

        this.doneKey = document.createElement("i");
        this.doneKey.className = "md md-check material-grid-col-3";
        this.doneKey.onclick = function () {
          that.clearAll();
          that.callEvent(2);
        }
        this.action.appendChild(this.doneKey);

        this.element.appendChild(this.action);

        var offsetTop = this.canvas.offsetParent.offsetTop + 48;
        var offsetLeft = this.canvas.offsetParent.offsetLeft;

        this.clearAll();

        this.canvas.onmousedown = function (e) {
          that.paint = true;
          that.addClick(e.pageX - offsetLeft, e.pageY - offsetTop);
        };

        this.canvas.onmousemove = function (e) {
          if (that.paint)
          that.addClick(e.pageX - offsetLeft, e.pageY - offsetTop, true);
        };

        this.canvas.onmouseup = function (e) {
          that.paint = false;
          that.clickInk.push([that.clickX, that.clickY, that.clickZ]);
          that.clickX = new Array();
          that.clickY = new Array();
          that.clickZ = new Array();
          that.getHandwriting();
        };

        this.canvas.onmouseleave = function (e) {
          that.paint = false;
        };


      }, {
        dlist: [",", ".", "?", "!", ":", "'", "\"", ";", "@"],

        callEvent: function(del, text) {
          this.dispatchEvent("edit", {
            eType: del,
            eText: text
          });
        },

        getHandwriting: function () {
          var that = this;
          if (this._promise) this._promise.cancel();
          this._promise = WinJS.Promise.as().then(function () {
            var useHTTPS = (typeof localSettings.values["https"] != 'undefined') ? localSettings.values["https"] : false;
            var http_prefix = (useHTTPS == true) ? "https" : "http";
            var url = http_prefix + "://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8";
            var data = {
              "device": "Mozilla/5.0 (Linux; Android 4.0.4; GT-i9100 Build/IML74K) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.49 Mobile Safari/537.31 ApiKey/1.257",
              "options": "enable_pre_space",
              "requests": [
                {
                  "writing_guide": {
                    "writing_area_width": that.context.canvas.width,
                    "writing_area_height": that.context.canvas.height
                  },
                  "ink": that.clickInk,
                  "language": localSettings.values["inputLang"]
                }
              ],
            };
            Custom.Utils.showNotif(WinJS.Resources.getString("recognizing").value);
            return WinJS.xhr({
              type: "post",
              url: url,
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify(data)
            })
          }).then(function (response) {
            if (response) {
              return JSON.parse(response.response)[1][0][1];
            }
          }).then(function (result) {
            if (!that.recogList) return;
            if (result.length > 0) {
              that.recogList.splice(0, that.recogList.length);
              result.forEach(function (suggestion) {
                that.recogList.push({
                  text: suggestion
                })
              });
              that.callEvent(0, result[0]);
            }
          }).then(null, function (err) {
            if (err.name != "Canceled")
            Custom.Utils.popupNoInternet();
          }).then(function () {
            Custom.Utils.hideNotif();
          }, function () {
            Custom.Utils.hideNotif();
          });
        },

        clearAll: function () {
          this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
          this.clickInk = new Array();
          this.clickX = new Array();
          this.clickY = new Array();
          this.clickZ = new Array();
          this.clickDrag = new Array();
          this.startTime = new Date().getTime();
          this.paint = false;

          var recogList = this.recogList;
          recogList.splice(0, recogList.length);
          this.dlist.forEach(function (suggestion) {
            recogList.push({
              text: suggestion
            })
          });
        },

        addClick: function (x, y, dragging) {
          this.clickX.push(Math.round(x));
          this.clickY.push(Math.round(y));
          this.clickDrag.push(dragging);
          var time = new Date().getTime();
          this.clickZ.push(time - this.startTime);
          var i = this.clickX.length - 1;
          this.context.beginPath();
          if (this.clickDrag[i] && i)
          this.context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
          else
          this.context.moveTo(this.clickX[i] - 1, this.clickY[i]);
          this.context.lineTo(this.clickX[i], this.clickY[i]);
          this.context.closePath();
          this.context.stroke();
        },

        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.onedit = null;
          this.clickX = null;
          this.clickY = null;
          this.clickZ = null;
          this.clickDrag = null;
          this.clickInk = null;
          this.paint = null;
          this.startTime = null;
          this.recog = null;
          this.recogLv = null;
          this.recogList = null;
          this.canvas = null;
          this.context = null;
          this.action = null;
          this.backSpace = null;
          this.spaceBar = null;
          this.doneKey = null;
          this.dlist = null;
          if (this._promise)
          this._promise.cancel();
          this._promise = null;
        }
      }
    ),
    Speak: WinJS.Class.define(
      function (element, options) {
        var that = this;
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "speak-control");
        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.listenButton = document.createElement("div");
        this.listenButton.className = "listen";
        var md = document.createElement("i");
        md.className = "md md-keyboard-voice";
        this.listenButton.appendChild(md);
        this.listenButton.onclick = function () {
          if (utils.hasClass(that.element, "active"))
          that.stopRecord();
          else
          that.startRecord();
        };
        this.element.appendChild(this.listenButton);

        this.waveA = document.createElement("div");
        this.waveA.className = "wave";
        this.element.appendChild(this.waveA);

        this.waveB = document.createElement("div");
        this.waveB.className = "wave2";
        this.element.appendChild(this.waveB);

        this.progress = document.createElement("progress");
        this.element.appendChild(this.progress);

        this.initDevice();

      }, {

        initDevice: function() {
          this.captureInitSettings = null;
          this.captureInitSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings();
          this.captureInitSettings.audioDeviceId = "";
          this.captureInitSettings.videoDeviceId = "";
          this.captureInitSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audio;
          this.systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView();
        },

        releaseDevice: function() {
          if (this.recordState == "recording" || this.mediaCaptureMgr != null) {
            utils.removeClass(this.element, "active");
            clearInterval(this.checkTime);
            this.recordState = null;
            this.mediaCaptureMgr.close();
            this.mediaCaptureMgr = null;
            app.removeEventListener("checkpoint", this.releaseDevice);
            this.systemMediaControls.onpropertychanged = null;
          }
        },

        startRecord: function () {
          var that = this;
          utils.addClass(this.element, "active");

          if (this.mediaCaptureMgr == null) {
            this.mediaCaptureMgr = new Windows.Media.Capture.MediaCapture();
            WinJS.Application.addEventListener("checkpoint", this.releaseDevice);
            this.systemMediaControls.onpropertychanged = function (e) {
              if (e.property === Windows.Media.SystemMediaTransportControlsProperty.soundLevel) {
                if (e.target.soundLevel === Windows.Media.SoundLevel.muted)
                that.releaseDevice();
                else
                that.initDevice();
              }
            }
          }
          this.mediaCaptureMgr.initializeAsync(this.captureInitSettings).then(function () {
            that.checkTime = setInterval(function () {
              that.stopRecord();
            }, 10000);
            that.recordState = "recording";
            var encodingProfile = Windows.Media.MediaProperties.MediaEncodingProfile.createWav(Windows.Media.MediaProperties.AudioEncodingQuality.auto);
            encodingProfile.audio.sampleRate = 16000;
            encodingProfile.audio.channelCount = 1;
            that.soundStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
            return that.mediaCaptureMgr.startRecordToStreamAsync(encodingProfile, that.soundStream);
          }).then(null, function() {});
        },

        stopRecord: function () {
          var that = this;
          clearInterval(this.checkTime);
          utils.removeClass(this.element, "active");
          if (this.recordState == "recording") {
            Custom.Utils.showNotif(WinJS.Resources.getString("recognizing").value);
            utils.addClass(this.element, "loading");
            this.mediaCaptureMgr.stopRecordAsync().then(function () {
              that.recordState = null;
              that.mediaCaptureMgr.close();
              that.mediaCaptureMgr = null;
              app.removeEventListener("checkpoint", that.release);
              that.systemMediaControls.onpropertychanged = null;
              var blob = MSApp.createBlobFromRandomAccessStream("audio/l16", that.soundStream);
              that.soundStream = null;
              var useHTTPS = (typeof localSettings.values["https"] != 'undefined') ? localSettings.values["https"] : false;
              var http_prefix = (useHTTPS == true) ? "https" : "http";
              var url  = http_prefix + "://www.google.com/speech-api/v2/recognize?output=json&lang=" + localSettings.values["inputLang"] + "&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw"
              if (that._promise) that._promise.cancel();
              that._promise = WinJS.xhr({
                type: "POST",
                url: url,
                data: blob,
                headers: {
                  "Content-Type": "audio/l16; rate=16000"
                }
              }).then(
                function (result) {
                  utils.removeClass(that.element, "loading");
                  Custom.Utils.hideNotif();
                  var response = result.response;
                  if (response.length > 14) {
                    response = response.substring(14, response.length);
                    var spres = JSON.parse(response).result[0].alternative[0].transcript;
                    that.callEvent(0, spres);
                    that.callEvent(2);
                  }
                },
                function () {
                  Custom.Utils.popupNoInternet();
                  Custom.Utils.hideNotif();
                  utils.removeClass(that.element, "loading");
                }
              );
            });
          }
        },

        callEvent: function(del, text) {
          this.dispatchEvent("edit", {
            eType: del,
            eText: text
          });
        },

        dispose: function () {
          if (this._disposed) { return; }
          this._disposed = true;
          utils.disposeSubTree(this.element);
          this.onedit = null;
          this.releaseDevice();
          this.listenButton = null;
          this.waveA = null;
          this.waveB = null;
          this.progress = null;
          this.soundStream = null;
          this.recordState = null;
          this.checkTime = null;
          this.captureInitSettings = null;
          this.mediaCaptureMgr = null;
          this.systemMediaControls = null;
          if (this._promise) this._promise.cancel();
          this._promise = null;
        }
      }
    ),
    Dictionary: WinJS.Class.define(
      function (element, options) {
        var that = this;
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.type = options.type;
        this.element.onclick = this._navtoDict.bind(this);
      },
      {
        dict: {
          get: function () { return this._dict; },
          set: function (value) {
            this._dict = value;
            if (value.length > 0)
            this.element.hidden = false;
            else
            this.element.hidden = true;
          }
        },

        _navtoDict: function () {
          nav.navigate("/pages/p-dict/p-dict.html", { dict: this.dict, title: this.title, type: this.type, source: this.source });
        }
      }
    ),
    SetData: WinJS.Class.define(
      function (element, options) {
        var that = this;
        this.element = element;
        element.winControl = this;

        utils.addClass(this.element, "win-disposable");
        this._disposed = false;

        this.type = options.type;
        this.element.onclick = this._setData.bind(this);
      },
      {
        _setData: function () {
          var pageControl = Custom.Navigation.navigator.pageControl;
          pageControl.bindingData.inputLang = this.inputLang;
          pageControl.bindingData.outputLang = this.outputLang;
          pageControl.bindingData.inputText = this.inputText;
        }
      }
    )
  });

  WinJS.Class.mix(Custom.Control.Write,
    WinJS.Utilities.createEventProperties("edit"),
    WinJS.UI.DOMEventMixin);

    WinJS.Class.mix(Custom.Control.Speak,
      WinJS.Utilities.createEventProperties("edit"),
      WinJS.UI.DOMEventMixin);

    })();
