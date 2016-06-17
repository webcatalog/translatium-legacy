import TokenUtils from "utils/token.js"

let player = null
let promise = null

export default class TTSUtils {
  static playSoundAsync() {
    return new WinJS.Promise((complete, error, progress) => {
      player.play()
      player.onended = () => {
        complete()
      }
    })
  }

  static stop() {
    if (player) player.pause()
    if (promise) promise.cancel()
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

  static ttsShortText(lang, text, idx, total) {
    return this.getGoogleTkk().then((tkk) => {
      let url = encodeURI("https://translate.google.com/translate_tts?ie=UTF-8&tl=" + lang + "&q=" + text + "&textlen=" + text.length + "&idx=" + idx + "&total=" + total +"&client=t&prev=input&tk=" + TokenUtils.TL(tkk, text))
      return WinJS.xhr({ url: url, responseType: "blob" }).then(response => {
        return response.response
      }, () => {
        let allVoices = Windows.Media.SpeechSynthesis.SpeechSynthesizer.allVoices
        let i = -1
        for (let j = 0; j < allVoices.length; j++) {
          if (allVoices[j].language.substr(0, 2) == lang) {
            i = j
            break
          }
        }
        if (i > -1) {
          let synth = new Windows.Media.SpeechSynthesis.SpeechSynthesizer()
          synth.voice = allVoices[i]
          return synth.synthesizeTextToStreamAsync(text).then(markersStream => {
            let blob = MSApp.createBlobFromRandomAccessStream(markersStream.ContentType, markersStream)
            return blob
          })
        }
      }).then(blob => {
        if (blob) {
          let url = URL.createObjectURL(blob, { oneTimeOnly: true })
          player = new Audio(url)
          return TTSUtils.playSoundAsync().then(() => {
            return true
          })
        }
        throw "fail to get blob"
      }).then(() => {
        return true
      })
    });
}

  static ttsText(lang, text) {
    TTSUtils.stop()
    promise = WinJS.Promise.as().then(() => {
      let strArr = []
      while (text.length > 0) {
        let stext
        if (text.length > 100) {
          let tmp = text.substr(0, 99)
          let last = tmp.lastIndexOf(" ")
          if (last == -1) last = tmp.length - 1
          stext = tmp.substr(0, last)
        }
        else {
          stext = text
        }
        strArr.push(stext)
        text = text.substr(stext.length)
      }
      return strArr
    }).then(strArr => {
      let i = 0
      let cF = () => {
        return TTSUtils.ttsShortText(lang, strArr[i], i, strArr.length).then(ok => {
          if ((ok == true) && (i < strArr.length - 1)) {
            i++
            return cF()
          }
        })
      }

      return cF()
    })
    return promise
  }
}
