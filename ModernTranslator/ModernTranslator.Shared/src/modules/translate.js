(function () {
  "use strict";

  var app = WinJS.Application;

  var applicationData = Windows.Storage.ApplicationData.current;
  var localSettings = applicationData.localSettings;

  function getGoogleTkk() {
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
          var endStr = ',experiment_ids:';
          var startI = body.indexOf(startStr) + startStr.length;
          var endI = body.indexOf(endStr);
          var tkkEval = body.substring(startI, endI);

          /* eslint-disable */
          var x = eval(eval(tkkEval));
          /* eslint-enable */
          sessionStorage.setItem('googleTkk', x);
          return sessionStorage.getItem('googleTkk');
        });
    }
    else {
      return WinJS.Promise.as(sessionStorage.getItem("googleTkk"));
    }
  }

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
        return getGoogleTkk()
          .then(function(tkk) {
            var url = encodeURI(Custom.Utils.getDomain() + "/translate_a/single?client=t&sl=" + inputLang + "&tl=" + outputLang + "&hl=en&dt=bd&dt=ex&dt=ld&dt=md&dt=qc&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&prev=btn&ssel=4&tsel=4&tk="+ TL(tkk, inputText) + "&q=" + inputText)
            return WinJS.xhr({
              type: "get",
              url: url,
              responseType: "json"
            })
          })
          .then(function (response) {
          var raw = response.response;
          var result = eval(raw);

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

  function translate(inputLang, outputLang, inputText) {
    return WinJS.Promise.as().then(function () {
      if (inputText.length < 1) return;

      return Custom.Translate.translateByGoogle(inputLang, outputLang, inputText);
    }).then(null, function (err) {});
  }

  function translateinBatch(inputLang, outputLang, inputArr) {
    var inputText = inputArr.join('\n');
    return translate(inputLang, outputLang, inputText)
      .then(function(result) {
        var outputText = result.outputText;
        return outputText.split('\n');
      });
  }

  WinJS.Namespace.define("Custom.Translate", {
    translateByGoogle: translateByGoogle,
    translate: translate,
    translateinBatch: translateinBatch
  });

})();
