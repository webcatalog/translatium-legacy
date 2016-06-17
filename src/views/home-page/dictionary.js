import React from "react"
import ReactWinJS from "react-winjs"
import connectToStores from "alt-utils/lib/connectToStores"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"
import SettingActions from "actions/setting.js"

class Dictionary extends React.Component {
  static contextTypes = {
    getString: React.PropTypes.func,
    settings: React.PropTypes.object,
    history: React.PropTypes.object
  }

  static getStores() {
    return [TranslationStore]
  }

  static getPropsFromStores() {
    return TranslationStore.getState()
  }

  translate(inputLang, outputLang, inputText) {
    SettingActions.setValues({ inputLang, outputLang })
    TranslationActions.getTranslation({ inputLang, outputLang, inputText, instant: true, save: true })
  }

  render() {
    if (!(this.props.outputObj && this.props.outputObj.outputDict)) return null
    let { outputDict } = this.props.outputObj
    let { inputLang, outputLang } = this.context.settings
    return (
      <div className="app-content app-dictionary">
        <div className="app-section">
          <div
            className="app-section-title win-h4"
            style={{ backgroundColor: this.context.settings.primaryColor.light }}>
            {this.context.getString("translations")}
          </div>
          {outputDict.map((x, i) => {
            return (
              <div className="app-sub-section" key={x[0]}>
                <div
                  className="app-sub-section-title"
                  style={{ backgroundColor: this.context.settings.primaryColor.light }}>
                  {this.context.getString(x[0])}
                </div>
                {x[2].map((y, j) => {
                  return (
                    <div className="app-item" key={"translationItem" + j}>
                      <h5 className="win-h5">
                        <span>{j+1}. </span>
                        <span
                          className="app-link"
                          onClick={this.translate.bind(this, outputLang, inputLang, y[0])}>
                          {y[0]}
                        </span>
                      </h5>
                      <h6 className="win-h6">
                        {y[1].map((meaning, k) => {
                          return (
                            <span key={"meaningSpan" + k}>
                              {(k > 0) ? (<span>, </span>) : null}
                              <span
                                className="app-link win-h5"
                                onClick={this.translate.bind(this, outputLang, inputLang, meaning)}>
                                {meaning}
                              </span>
                            </span>
                          )
                        })}
                      </h6>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
export default connectToStores(Dictionary)
