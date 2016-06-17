import PouchDB from "pouchdb"
import alt from "flalt.js"
import TranslationActions from "actions/translation.js"
import TranslateUtils from "utils/translate.js"

class TranslationStore {
  constructor() {
    this.bindListeners({
      getTranslation: TranslationActions.getTranslation,
      loadTranslation: TranslationActions.loadTranslation,
      addToFavorites: TranslationActions.addToFavorites,
      removeFromFavorites: TranslationActions.removeFromFavorites,
      clearTranslation: TranslationActions.clearTranslation
    })

    this.state = {
      status: "none",
      inputObj: null,
      outputObj: null,
      saved: null,
      loadedFrom: null,
      favoriteId: null
    }
    this.timer = null
    this.favoriteDb = new PouchDB("favorites")
  }

  addToFavorites() {
    let inputObj = Object.assign({}, this.state.inputObj)
    let outputObj = Object.assign({}, this.state.outputObj)

    inputObj.save = undefined
    inputObj.noLoad = undefined
    inputObj.instant = undefined
    inputObj.preferredProvider = undefined

    outputObj.suggestedInputText = undefined
    outputObj.suggestedInputLang = undefined
    if (inputObj.inputLang == "auto") {
      inputObj.inputLang = outputObj.detectedInputLang
    }
    outputObj.detectedInputLang = undefined

    let favoriteId = new Date().toJSON()
    this.favoriteDb.put({
      _id: favoriteId,
      inputObj, outputObj
    })
    .then(() => {
      this.setState({ favoriteId })
    })
  }

  removeFromFavorites() {
    this.favoriteDb.get(this.state.favoriteId)
      .then(doc => {
        return this.favoriteDb.remove(doc)
      })
      .then(() => {
        this.setState({ favoriteId: null })
      })
  }

  getTranslation(newInputObj) {

    if (!newInputObj.noLoad) newInputObj.noLoad = false
    if (!newInputObj.save) newInputObj.save = false
    if (!newInputObj.loadedFrom) newInputObj.loadedFrom = null

    let inputObj = {
      ...this.state.inputObj,
      ...newInputObj
    }

    if (typeof inputObj.inputText != "string") return
    clearTimeout(this.timer)

    if (inputObj.noLoad == true) {
      this.setState({ status: "none", inputObj: inputObj, outputObj: null, favoriteId: null })
    }
    else if (inputObj.instant == true) {
      this.setState({ status: "loading", inputObj: inputObj, outputObj: null, favoriteId: null })
      TranslateUtils.translate(inputObj)
        .then(outputObj => {
          if (JSON.stringify(this.state.inputObj) !== JSON.stringify(inputObj))
            return
          if (outputObj) {
            this.setState({ status: "successful", outputObj, saved: inputObj.save })
          }
          else {
            this.setState({ status: "failed" })
          }
        }, () => {})
    }
    else {
      this.setState({ status: "none", inputObj: inputObj, outputObj: null, favoriteId: null })
      if (inputObj.inputText.trim().length < 1) return
      this.timer = setTimeout(() => {
        TranslateUtils.translate(inputObj)
          .then(outputObj => {
            if (JSON.stringify(this.state.inputObj) !== JSON.stringify(inputObj))
              return
            if (outputObj) {
              this.setState({ status: "successful", outputObj, saved: inputObj.save })
            }
          }, () => {})
      }, 300)
    }
  }

  clearTranslation() {
    this.setState({
      status: "none",
      inputObj: null,
      outputObj: null
    })
  }

  loadTranslation({ inputObj, outputObj, loadedFrom, favoriteId }) {
    this.setState({ status: "successful", inputObj, outputObj, loadedFrom, favoriteId })
  }
}

export default alt.createStore(TranslationStore, "TranslationStore")
