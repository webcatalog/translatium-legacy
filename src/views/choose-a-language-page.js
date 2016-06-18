import React from "react"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"
import LanguageUtils from "utils/language.js"
import SettingActions from "actions/setting.js"
import OcrActions from "actions/ocr.js"
import OcrStore from "stores/ocr.js"

class ChooseALanguagePage extends React.Component {
  constructor(props, context) {
    super(props)

    let languageArr
    switch (context.location.query.type) {
      case "input-ocr":
        languageArr = LanguageUtils.getOcrSupportedLanguages()
        break
      case "input":
        languageArr = LanguageUtils.getInputLanguages()
        break
      case "output":
      case "output-ocr":
        languageArr = LanguageUtils.getOutputLanguages()
        break
    }
    languageArr.sort(function (x, y) {
      if (x == "auto") return -1
      if (y == "auto") return 1
      return context.getString(`/languages/${x}`).localeCompare(context.getString(`/languages/${y}`))
    })

    this.state = { languageArr }
  }

  handleItemInvoked(langId) {
    this.context.history.goBack()

    let outputLang = this.context.settings.outputLang
    let inputLang = this.context.settings.inputLang

    switch(this.context.location.query.type) {
      case "input":
      case "input-ocr":
        if (langId == outputLang) {
          let tmp = inputLang
          inputLang = outputLang
          outputLang = tmp
          SettingActions.setValues({ inputLang, outputLang })
        }
        else {
          inputLang = langId
          SettingActions.setValue({ name: "inputLang", value: langId })
        }
        break
      case "output":
      case "output-ocr":
        if (langId == inputLang) {
          let tmp = inputLang
          inputLang = outputLang
          outputLang = tmp
          SettingActions.setValues({ inputLang, outputLang })
        }
        else {
          outputLang = langId
          SettingActions.setValue({ name: "outputLang", value: langId })
        }
        break
    }

    switch(this.context.location.query.type) {
      case "input":
      case "output":
       TranslationActions.getTranslation({
          inputLang: inputLang,
          outputLang: outputLang,
          preferredProvider: this.context.settings.preferredProvider,
          instant: false
        })
        break
      case "input-ocr":
        OcrActions.recognizeAndTranslate({
          inputLang: inputLang,
          outputLang: outputLang,
          file: OcrStore.getState().file
        })
        break
      case "output-ocr":
        OcrActions.translate({
          outputLang: outputLang
        })
        break
    }
  }

  render() {
    return (
      <div className="app-choose-a-language-page">
        {(() => {
          if (this.context.location.query.type != "input-ocr" && this.context.settings.recentLangList.length > 0) {
            return (
              <div>
                <div
                  className="app-group-item win-h3"
                  style={{backgroundColor: this.context.settings.primaryColor.light}}>
                  {this.context.getString("recent")}
                </div>
                {this.context.settings.recentLangList.map(lang => {
                  return (
                    <div
                      className="app-item"
                      onClick={this.handleItemInvoked.bind(this, lang)}
                      key={lang}>
                      <h4 className="win-h4">
                        {this.context.getString(`/languages/${lang}`)}
                      </h4>
                    </div>
                  )
                })}
              </div>
            )
          }
        })()}
        <div
          className="app-group-item win-h4"
          style={{backgroundColor: this.context.settings.primaryColor.light}}>
          {this.context.getString("all")}
        </div>
        {this.state.languageArr.map(lang => {
          return (
            <div
              className="app-item"
              onClick={this.handleItemInvoked.bind(this, lang)}
              key={lang}>
              <h4 className="win-h4">
                {this.context.getString(`/languages/${lang}`)}
              </h4>
            </div>
          )
        })}
      </div>
    )
  }
}

ChooseALanguagePage.contextTypes = {
  settings: React.PropTypes.object,
  history: React.PropTypes.object,
  location: React.PropTypes.object,
  getString: React.PropTypes.func,
};


export default ChooseALanguagePage
