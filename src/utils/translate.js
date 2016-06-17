import LanguageUtils from "utils/language.js"
import TokenUtils from "utils/token.js"
import SettingStore from "stores/setting.js"

function generateGoogleTranslateURL(path) {
  if (SettingStore.getState().chinaMode == true) {
    return encodeURI("http://translate.google.cn" + path)
  }
  else {
    return encodeURI("https://translate.google.com" + path)
  }
}

class TranslateUtils {
  static translateShortTextByGoogle({ inputLang, outputLang, inputText }) {
    return this.getGoogleTkk()
      .then(tkk => {
        const urlPath = "/translate_a/single?client=t&sl="
                        + LanguageUtils.googleStandardlized(inputLang)
                        + "&tl="
                        + LanguageUtils.googleStandardlized(outputLang)
                        + "&hl=en&dt=bd&dt=ex&dt=ld&dt=md&dt=qc&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&source=btn&kc=0&ssel=4&tsel=4&tk="
                        + TokenUtils.TL(tkk, inputText)
                        +"&q="
                        + inputText
        const url = generateGoogleTranslateURL(urlPath)
        return WinJS.xhr({
          url: url,
          responseType: "text"
        });
      })
      .then(response => {
        return response.response
      })
      .then(body => {
        let i = 0
        let jsonStr = ""
        while (i < body.length) {
          if ((body[i] == ",") || (body[i] == "[")) {
            switch (body[i + 1]) {
              case ",":
              case "]":
                jsonStr += body[i] + "null"
                i++
                break
              case "\"":
                let tmp = body.substring(i + 2)
                let j = tmp.indexOf("\"")
                while ((tmp[j - 1] == "\\") && (tmp[j-2] != "\\")) {
                  j = j + 1 + tmp.substring(j + 1).indexOf("\"")
                }
                j = i + 2 + j
                jsonStr += body.substring(i, j + 1)
                i = j + 1
                break
              default:
                jsonStr += body[i]
                i++
            }
          }
          else {
            jsonStr += body[i]
            i++
          }
        }
        return JSON.parse(jsonStr)
      })
      .then(result => {
        let outputText = ""
        let inputRoman = undefined
        let outputRoman = undefined
        if (result[0]) {
          result[0].forEach(part => {
            if (part[0]) {
              outputText += part[0]
            }
            else {
              if (part[2]) outputRoman = (outputRoman) ? outputRoman + part[2] : part[2]
              if (part[3]) inputRoman = (inputRoman) ? inputRoman + part[3] : part[3]
            }
          })
        }
        if (outputLang == "zh-YUE") outputRoman = undefined

        let outputSegments = [outputText]
        if (result[5]) {
          outputSegments = result[5].map(segment => {
            return {
              "inputText": segment[0],
              "outputArr": (segment[2]) ? segment[2].map(arr => {
                return {
                  "text": arr[0],
                  "accuracy": arr[1]
                }
              }) : null
            }
          })
        }

        let detectedInputLang = result[2]
        if (detectedInputLang == "zh-CN") detectedInputLang = "zh"

        let inputDict = undefined
        if ((result[11]) || (result[12]) || (result[13]) || (result[14]))
          inputDict = [result[11], result[12], result[13], result[14]]

        let outputDict = result[1]

        let suggestedInputLang = undefined
        if (result[8]) {
            suggestedInputLang = result[8][0][0]
        }
        if (suggestedInputLang == "zh-CN") suggestedInputLang = "zh"

        let suggestedInputText = undefined
        if (result[7]) {
          suggestedInputText = result[7][1]
        }
        return { outputText, inputRoman, outputRoman, outputSegments, detectedInputLang, inputDict, outputDict, suggestedInputLang, suggestedInputText }
      })
      .then(null, err => {
        return
      })
  }

  static translateLongTextByGoogle({ inputLang, outputLang, inputText }) {
    let tmp = inputText.substr(0, 100)
    for (var i = 200; i < inputText.length; i = i + 100) {
      if (encodeURIComponent(inputText.substr(0, i)).length > 1000) {
        break
      }
      tmp = inputText.substr(0, i)
    }

    let last = tmp.lastIndexOf(" ")
    if (last == -1) last = tmp.length - 1
    let leftInputText = tmp.substr(0, last)
    let rightInputText = inputText.substr(last + 1, inputText.length - leftInputText.length)
    let leftRes, rightRes
    let promises = []
    promises.push(this.translateShortTextByGoogle({ inputLang, outputLang, inputText: leftInputText }).then(result => {
      leftRes = result
    }))

    promises.push(this.translateByGoogle({ inputLang, outputLang, inputText: rightInputText }).then(result => {
      rightRes = result
    }))

    return WinJS.Promise.join(promises).then(() => {
      if ((!leftRes) || (!rightRes)) return
      return {
        outputText: `${leftRes.outputText} ${rightRes.outputText}`,
        inputRoman: (leftRes.inputRoman && rightRes.inputRoman) ? `${leftRes.inputRoman} ${rightRes.inputRoman}` : null,
        outputRoman: (leftRes.outputRoman && rightRes.outputRoman) ? `${leftRes.outputRoman} ${rightRes.outputRoman}` : null,
        outputSegments: leftRes.outputSegments.concat(rightRes.outputSegments),
        detectedInputLang: leftRes.detectedInputLang
      }
    })
  }

  static translateByGoogle({ inputLang, outputLang, inputText }) {
    return WinJS.Promise.as()
      .then(() => {
        if (encodeURIComponent(inputText).length > 1000) {
          return this.translateLongTextByGoogle({ inputLang, outputLang, inputText })
        }
        else {
          return this.translateShortTextByGoogle({ inputLang, outputLang, inputText })
        }
      })
      .then(result => {
        if (result) {
          result.provider = "Google"
          return result
        }
      })
  }

  static translateInBatchByGoogle({ inputLang, outputLang, inputArr }) {
    return this.getGoogleTkk()
      .then(tkk => {
        let urlPath = "/translate_a/t?client=mt&sl="
                    + LanguageUtils.googleStandardlized(inputLang)
                    + "&tl="
                    + LanguageUtils.googleStandardlized(outputLang)
                    + "&hl=en&v=1.0&tk="
                    + TokenUtils.TL(tkk, inputArr.join(""))
        let nextArr = []
        for (let i = 0; i < inputArr.length; i++) {
          if (encodeURI(urlPath + "&q" + inputArr[i]).length > 2000) {
            nextArr = inputArr.slice(i, inputArr.length)
            break
          }
          else {
            urlPath += "&q="
            urlPath += inputArr[i]
          }
        }

        if (nextArr.length > 0) {
          let promises = []
          let leftRes, rightRes
          promises.push(
            WinJS.xhr({
              url: url,
              responseType: "json"
            }).then(response => {
                return response.response
              }).then(result => {
                leftRes = result
              })
          )
          promises.push(
            this.translateInBatchByGoogle({ inputLang, outputLang, inputArr: nextArr })
              .then(result => {
                rightRes = result
              })
          )
          return WinJS.Promise.join(promises).then(() => {
            if ((!leftRes) || (!rightRes)) return
            return { outputArr: leftRes.concat(rightRes) }
          })
        }


        const url = generateGoogleTranslateURL(urlPath)
        return WinJS.xhr({
          url: url,
          responseType: "json"
        })
        .then(response => {
          return response.response
        })
        .then(outputArr => {
          if (typeof outputArr !== "object") return { outputArr: [outputArr] }
          return { outputArr }
        })
        .then(result => {
          result.provider = "Google"
          return result
        })
      })
      .then(null, err => {
        return
      })
  }

  static getMicrosoftAppId() {
    if (sessionStorage.getItem("microsoftAppId") === null) {
      let url = "https://www.bing.com/translator/dynamic/223578/js/LandingPage.js"
      return WinJS.xhr({
        url: url,
        responseType: "text"
      }).then(response => {
          return response.response
        })
        .then(body => {
          sessionStorage.setItem("microsoftAppId", body.substr(body.indexOf("appId:") + 6, 47))
          return sessionStorage.getItem("microsoftAppId")
        })
    }
    else {
      return WinJS.Promise.as(sessionStorage.getItem("microsoftAppId"))
    }
  }

  static getGoogleTkk() {
    if (sessionStorage.getItem("googleTkk") === null) {
      let url = "https://translate.google.com/m/translate"
      return WinJS.xhr({
        url: url,
        responseType: "text",
      }).then(response => {
          return response.response
        })
        .then(body => {
          const startStr = 'campaign_tracker_id:\'1h\',tkk:';
          const endStr = ',enable_formality:false';
          const startI = body.indexOf(startStr) + startStr.length;
          const endI = body.indexOf(endStr);
          const tkkEval = body.substring(startI, endI);

          const x = eval(eval(tkkEval));
          sessionStorage.setItem("googleTkk", x);
          return sessionStorage.getItem("googleTkk");
        })
    }
    else {
      return WinJS.Promise.as(sessionStorage.getItem("googleTkk"))
    }
  }

  static translateByMicrosoft({ inputLang, outputLang, inputText }) {
    return this.getMicrosoftAppId()
      .then(appId => {
        if (!appId) return

        let texts = inputText.split("\n");
        const url = encodeURI(
                      "https://api.microsofttranslator.com/v2/ajax.svc/TranslateArray2?appId="
                      + appId
                      + "&texts="
                      + JSON.stringify(texts)
                      + "&from="
                      + LanguageUtils.microsoftStandardlized(inputLang)
                      + "&to="
                      + LanguageUtils.microsoftStandardlized(outputLang)
                      + "&options={}"
                    )
        return WinJS.xhr({
          url: url,
          responseType: "json"
        })
      })
      .then(response => {
        return response.response
      })
      .then(result => {
        let detectedInputLang = result[0].From
        if (detectedInputLang == "zh-CHS")
          detectedInputLang = "zh-CN"
        else if (detectedInputLang == "zh-CHT")
          detectedInputLang = "zh-TW"

        let outputText = ""
        result.forEach(function (x) {
          outputText += x.TranslatedText + "\n"
        })

        return {
          outputText: outputText,
          detectedInputLang: detectedInputLang,
        }
      })
      .then(result => {
        if (result) {
          result.provider = "Microsoft"
          return result
        }
      })
      .then(null, err => {
        return
      })
  }

  static translateInBatchByMicrosoft({ inputLang, outputLang, inputArr }) {
    return this.getMicrosoftAppId()
      .then(appId => {
        if (!appId) return

        let inputTexts = JSON.stringify(inputArr);
        const url = encodeURI(
                      "http://api.microsofttranslator.com/v2/ajax.svc/TranslateArray2?appId="
                      + appId
                      + "&texts="
                      + inputTexts
                      + "&from="
                      + LanguageUtils.microsoftStandardlized(inputLang)
                      + "&to="
                      + LanguageUtils.microsoftStandardlized(outputLang)
                      + "&options={}"
                    )
          return WinJS.xhr({
            url: url,
            responseType: "json"
          })
      })
      .then(response => {
        return response.response
      })
      .then(result => {
        if (typeof result != "object") {
          WinJS.Application.sessionState.microsoftAppId = null
          return
        }
        let arr = []
        result.forEach(function (x) {
          arr.push(x.TranslatedText)
        });
        return arr
      })
      .then(result => {
        if (result) {
          result.provider = "Microsoft"
          return result
        }
      })
      .then(null, err => {
        return
      })
  }

  static translate({ inputLang, outputLang, inputText, preferredProvider = "google" }) {
    if (inputText.length < 1) return WinJS.Promise.as(null)

    if (LanguageUtils.onlyMicrosoftSupported(inputLang)) {
      if (LanguageUtils.microsoftSupported(outputLang))
        return this.translateByMicrosoft({ inputLang, outputLang, inputText })

      return this.translateByMicrosoft({ inputLang, outputLang: "en", inputText })
        .then(result => {
          if (!result) return
          return this.translateByGoogle({ inputLang: "en", outputLang, inputText: result.outputText })
        })
        .then(result => {
          if (result) {
            delete result["inputDict"]
            delete result["outputDict"]
            delete result["suggestedInputLang"]
            delete result["suggestedInputText"]
            result.provider = "Google + Microsoft"
            return result
          }
        })
    }


    if (LanguageUtils.onlyMicrosoftSupported(outputLang)) {
      if (LanguageUtils.microsoftSupported(inputLang)) {
        return this.translateByMicrosoft({ inputLang, outputLang, inputText })
      }
      return this.translateByGoogle({ inputLang, outputLang: "en", inputText })
        .then(result => {
          if (!result) return
          return this.translateByMicrosoft({ inputLang: "en", outputLang, inputText: result.outputText })
        })
        .then(result => {
          if (result) {
            result.provider = "Google + Microsoft"
            return result
          }
        })
    }

    if ((preferredProvider == "microsoft")
      && (LanguageUtils.microsoftSupported(inputLang))
      && (LanguageUtils.microsoftSupported(outputLang))) {
      return this.translateByMicrosoft({ inputLang, outputLang, inputText })
    }

    return this.translateByGoogle({ inputLang, outputLang, inputText })
  }

  static translateInBatch({ inputLang, outputLang, inputArr, preferredProvider = "google" }) {
    if (inputArr.length < 1) return WinJS.Promise.as(null)
    if (LanguageUtils.onlyMicrosoftSupported(inputLang)) {
      if (LanguageUtils.microsoftSupported(outputLang))
        return this.translateInBatchByMicrosoft({ inputLang, outputLang, inputArr })

      return this.translateInBatchByMicrosoft({ inputLang, outputLang: "en", inputArr })
        .then(result => {
          return this.translateInBatchByGoogle({ inputLang: "en", outputLang, inputArr: result.outputText })
        })
        .then(result => {
          if (result) {
            result.provider = "Google + Microsoft"
            return result
          }
        })
    }

    if (LanguageUtils.onlyMicrosoftSupported(outputLang)) {
      if (LanguageUtils.microsoftSupported(inputLang))
        return this.translateInBatchByMicrosoft({ inputLang, outputLang, inputArr })

      return this.translateInBatchByGoogle({ inputLang, outputLang: "en", inputArr })
        .then(result => {
          return this.translateInBatchByMicrosoft({ inputLang: "en", outputLang, inputArr: result.outputText })
        })
        .then(result => {
          if (result) {
            result.provider = "Google + Microsoft"
            return result
          }
        })
    }

    if ((preferredProvider == "microsoft")
      && (LanguageUtils.microsoftSupported(inputLang))
      && (LanguageUtils.microsoftSupported(outputLang))) {
      return this.translateInBatchByMicrosoft({ inputLang, outputLang, inputArr })
    }

    return this.translateInBatchByGoogle({ inputLang, outputLang, inputArr })
  }
}
export default TranslateUtils
