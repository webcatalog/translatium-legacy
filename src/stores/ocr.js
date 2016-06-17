import alt from "flalt.js"
import OcrActions from "actions/ocr.js"
import TranslateUtils from "utils/translate.js"
import LanguageUtils from "utils/language.js"

class OcrStore {
  constructor() {
    this.bindListeners({
      recognizeAndTranslate: OcrActions.recognizeAndTranslate,
      translate: OcrActions.translate
    })

    this.state = {
      file: null,
      inputLang: null,
      outputLang: null,
      status: "none",
      result: {
        imgHeight: null,
        imgWidth: null,
        ratio: null,
        ocrResult: null
      }
    }
  }

  recognizeAndTranslate({ inputLang, outputLang, file }) {
    let lang = new Windows.Globalization.Language(LanguageUtils.ocrStandardlized(inputLang))
    if (!Windows.Media.Ocr.OcrEngine.isLanguageSupported(lang)) {
      this.setState({
        status: "recognizing",
        file, inputLang, outputLang,
        result: null
      })

      let imgWidth, imgHeight, ratio
      let inMemoryRandomAccessStream = new Windows.Storage.Streams.InMemoryRandomAccessStream()
      file.openAsync(Windows.Storage.FileAccessMode.read)
        .then(stream => {
          let bitmapDecoder = Windows.Graphics.Imaging.BitmapDecoder
          return bitmapDecoder.createAsync(stream)
        }).then(decoder => {
          imgWidth = decoder.pixelWidth
          imgHeight = decoder.pixelHeight

          ratio = 1
          const maxImageDimension = Windows.Media.Ocr.OcrEngine.maxImageDimension
          if (imgHeight > maxImageDimension
            || imgWidth > maxImageDimension) {
            ratio = maxImageDimension / Math.max(imgHeight, imgWidth)
          }
          if (imgHeight < 40 || imgWidth < 40) {
            ratio = Math.min(imgHeight, imgWidth) / 40
          }

          imgHeight = Math.floor(imgHeight * ratio)
          imgWidth = Math.floor(imgWidth * ratio)

          return Windows.Graphics.Imaging.BitmapEncoder.createForTranscodingAsync(inMemoryRandomAccessStream, decoder)
        })
        .then(encoder => {
          if (ratio != 1) {
            encoder.bitmapTransform.scaledHeight = imgHeight
            encoder.bitmapTransform.scaledWidth = imgWidth
          }
          return encoder.flushAsync()
        })
        .then(() => {
          return inMemoryRandomAccessStream.flushAsync()
        })
        .then(() => {
          let blob = window.MSApp.createBlobFromRandomAccessStream("image/jpeg", inMemoryRandomAccessStream);
          let fdata = new FormData()

          fdata.append("file", blob, "image.jpg")
          fdata.append("language", LanguageUtils.ocrSpaceStandardlized(inputLang))
          fdata.append("apikey", "0088228ab088957")
          fdata.append("isOverlayRequired", true)

          return WinJS.xhr({
            type: "post",
            url: "https://api.ocr.space/Parse/Image",
            data: fdata
          })
        })
        .then(response => {
          const result = JSON.parse(response.response)
          if (result["OCRExitCode"] == "1") {
            let ocrResult = {}
            ocrResult.text = result["ParsedResults"][0]["ParsedText"]
            ocrResult.lines = result["ParsedResults"][0]["TextOverlay"]["Lines"].map(parsedLine => {
              let line = {}
              line.words = parsedLine["Words"].map(word => {
                return {
                  text: word["WordText"],
                  boundingRect: {
                    x: word["Left"],
                    y: word["Top"],
                    height: word["Height"]
                  }
                }
              })
              return line
            })
            this.setState({
              status: "recognized",
              result: { ocrResult, imgHeight, imgWidth, ratio }
            })
            return this.translate({ outputLang })
          }

          this.setState({
            status: "noTextRecognized",
            result: null
          })
        })
        .then(null, err => {
          this.setState({
            status: "failedToConnect"
          })
        })

      return
    }

    this.setState({
      status: "recognizing",
      file, inputLang, outputLang,
      result: null
    })
    let imgWidth, imgHeight, ratio
    file.openAsync(Windows.Storage.FileAccessMode.read)
      .then(stream => {
        let bitmapDecoder = Windows.Graphics.Imaging.BitmapDecoder
        return bitmapDecoder.createAsync(stream)
      }).then(decoder => {
        imgWidth = decoder.pixelWidth
        imgHeight = decoder.pixelHeight

        ratio = 1
        const maxImageDimension = Windows.Media.Ocr.OcrEngine.maxImageDimension
        if (imgHeight > maxImageDimension
          || imgWidth > maxImageDimension) {
          ratio = maxImageDimension / Math.max(imgHeight, imgWidth)
        }
        if (imgHeight < 40 || imgWidth < 40) {
          ratio = Math.min(imgHeight, imgWidth) / 40
        }

        if (ratio == 1) return decoder.getSoftwareBitmapAsync()

        imgHeight = Math.floor(imgHeight * ratio)
        imgWidth = Math.floor(imgWidth * ratio)

        let bitmapTransform = new Windows.Graphics.Imaging.BitmapTransform()
        bitmapTransform.scaledHeight = imgHeight
        bitmapTransform.scaledWidth = imgWidth

        return decoder.getSoftwareBitmapAsync(
          Windows.Graphics.Imaging.BitmapPixelFormat.unknown,
          Windows.Graphics.Imaging.BitmapAlphaMode.premultiplied,
          bitmapTransform,
          Windows.Graphics.Imaging.ExifOrientationMode.ignoreExifOrientation,
          Windows.Graphics.Imaging.ColorManagementMode.doNotColorManage
        )
      }).then(bitmap => {
        let lang = new Windows.Globalization.Language(inputLang)
        let ocrEngine = Windows.Media.Ocr.OcrEngine.tryCreateFromLanguage(lang)
        return ocrEngine.recognizeAsync(bitmap)
      }).then(ocrResult => {
        if (ocrResult.text.length < 1) {
          this.setState({
            status: "noTextRecognized",
            result: null
          })
          return
        }
        this.setState({
          status: "recognized",
          result: { ocrResult, imgHeight, imgWidth, ratio }
        })
        return this.translate({ outputLang })
      })
  }

  translate({ outputLang }) {
    this.setState({
      status: "translating",
      outputLang
    })
    let inputArr = []
    let { ocrResult } = this.state.result
    if (!ocrResult) return
    let inputLang = this.state.inputLang
    ocrResult.lines.forEach(line => {
      let lineText = ""
      line.words.forEach(word => {
        lineText += word.text + " "
      })
      inputArr.push(lineText)
    })
    TranslateUtils.translateInBatch({ inputLang, outputLang, inputArr })
      .then(outputObj => {
        if (!outputObj) {
          this.setState({
            status: "failedToConnect"
          })
          return
        }
        let { outputArr } = outputObj
        let translatedResult = []
        ocrResult.lines.forEach((line, i) => {
          translatedResult.push({
            text: outputArr[i],
            boundingRect: line.words[0].boundingRect
          })
        })
        this.setState({
          status: "translated",
          result: {
            ...this.state.result,
            translatedResult
          }
        })
      })
  }
}

export default alt.createStore(OcrStore, "OcrStore")
