import React from "react"
import ReactWinJS from "react-winjs"
import connectToStores from "alt-utils/lib/connectToStores"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"

class InputBox extends React.Component {
  static getStores() {
    return [TranslationStore]
  }

  static getPropsFromStores() {
    return TranslationStore.getState()
  }

  handleTranslateButtonClick() {
    TranslationActions.getTranslation({
      inputLang: this.context.settings.inputLang,
      outputLang: this.context.settings.outputLang,
      preferredProvider: this.context.settings.preferredProvider,
      instant: true,
      save: true
    })
  }

  handleInputText(e) {
    const inputText = e.target.value
    TranslationActions.getTranslation({
      inputLang: this.context.settings.inputLang,
      outputLang: this.context.settings.outputLang,
      inputText: inputText,
      preferredProvider: this.context.settings.preferredProvider,
      instant: false,
      noLoad: (this.context.settings.realTime == false || this.context.expanded)
    })
  }

  render() {
    let buttonDisabled = !(this.props.inputObj && this.props.inputObj.inputText.trim().length > 0)
    return (
      <div className="app-input-container">
        <textarea
          ref="textarea"
          spellCheck={false}
          placeholder={this.context.getString("type-something-here")}
          className="win-textarea app-textarea"
          lang={this.context.settings.inputLang}
          onInput={this.handleInputText.bind(this)}
          value={(this.props.inputObj) ? this.props.inputObj.inputText : ""}/>
        <button
          className="win-button app-translate-button"
          style={(!buttonDisabled) ? { backgroundColor: this.context.settings.primaryColor.light, color: "#fff" } : null}
          disabled={buttonDisabled}
          onClick={this.handleTranslateButtonClick.bind(this)}>
          {this.context.getString("translate")}
        </button>
      </div>
    )
  }
}

InputBox.contextTypes = {
  settings: React.PropTypes.object,
  getString: React.PropTypes.func,
  expanded: React.PropTypes.bool,
};

export default connectToStores(InputBox);
