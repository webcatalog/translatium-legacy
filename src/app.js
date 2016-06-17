"use strict"

import ReactDOM from "react-dom"
import AppRoutes from "routes.js"

import SettingStore from "stores/setting.js"
import SettingActions from "actions/setting.js"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"

import LanguageUtils from "utils/language.js"

WinJS.Application.onactivated = args => {
  let settings = SettingStore.getState()

  switch (args.detail.kind) {
    case Windows.ApplicationModel.Activation.ActivationKind.protocol:
      if (args.detail.uri.path == "translate") {
        let params = (() => {
          let query = args.detail.uri.query.substring(1)
          let result = {}
          query.split("&").forEach(function(part) {
            let item = part.split("=")
            result[item[0]] = decodeURIComponent(item[1])
          })
          return result
        })()

        let { inputLang, outputLang, preferredProvider } = settings
        if (params.outputLang && (LanguageUtils.getOutputLanguages().indexOf(params.outputLang) > -1)) {
          SettingActions.setValue({ name: "outputLang", value: params.outputLang })
        }
        if (params.inputLang && (LanguageUtils.getInputLanguages().indexOf(params.inputLang) > -1)) {
          SettingActions.setValue({ name: "inputLang", value: params.inputLang })
        }
        let inputText = params.inputText || ""

        TranslationActions.getTranslation({ inputLang, outputLang, inputText, preferredProvider, instant: true })
        if (window.goBackHome) window.goBackHome()
      }
      break

    case Windows.ApplicationModel.Activation.ActivationKind.shareTarget:
      let shareOperation = args.detail.shareOperation
      if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
        shareOperation.data.getTextAsync()
          .then(inputText => {
            let { inputLang, outputLang, preferredProvider } = settings
            SettingActions.setValue({ name: "inputLang", value: inputLang })
            SettingActions.setValue({ name: "outputLang", value: outputLang })
            TranslationActions.getTranslation({ inputLang, outputLang, inputText, preferredProvider, instant: true })
            if (window.goBackHome) window.goBackHome()
          })
      }
      break

    case Windows.ApplicationModel.Activation.ActivationKind.launch:
      if (args.detail.arguments.substr(0,13) == "tile_shortcut") {
        let lang = args.detail.arguments.substr(13, args.detail.arguments.length - 13).split("_")
         SettingActions.setValue({ name: "inputLang", value: lang[0] })
         SettingActions.setValue({ name: "outputLang", value: lang[1] })
         if (window.goBackHome) window.goBackHome()
      }
      break
  }

  ReactDOM.render(AppRoutes, document.getElementById("app"))
}


WinJS.Application.start()
