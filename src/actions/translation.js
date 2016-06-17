import alt from "flalt.js"

class TranslationActions {
  getTranslation(inputObj) {
    return inputObj
  }

  loadTranslation(data) {
    return data
  }


  clearTranslation() {
    return {}
  }

  addToFavorites() {
    return {}
  }

  removeFromFavorites() {
    return {}
  }
}

export default alt.createActions(TranslationActions)
