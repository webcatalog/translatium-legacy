import alt from "flalt.js"

class OcrActions {
  translate({ outputLang }) {
    return { outputLang }
  }
  recognizeAndTranslate({ inputLang, outputLang, file }) {
    return { inputLang, outputLang, file }
  }
}

export default alt.createActions(OcrActions)
