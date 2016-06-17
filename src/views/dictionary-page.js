import React from "react"
import ReactWinJS from "react-winjs"
import connectToStores from "alt-utils/lib/connectToStores"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"
import SettingActions from "actions/setting.js"
import Animation from "views/animation.js"

class DictionaryPage extends React.Component {
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
    this.context.history.goBack()
    SettingActions.setValues({ inputLang, outputLang })
    TranslationActions.getTranslation({ inputLang, outputLang, inputText, instant: true, save: true })
  }

  renderOutputDict() {
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

  renderInputDict() {
    let { inputDict } = this.props.outputObj
    let { inputLang, outputLang } = this.context.settings
    return(
      <div className="app-content app-dictionary">
        {(inputDict[1]) ? (
          <div key="definitions" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{ backgroundColor: this.context.settings.primaryColor.light }}>
              {this.context.getString("definitions")}
            </div>
            {inputDict[1].map((x, i) => {
              return(
                <div className="app-sub-section" key={"definitionSubSection" + i}>
                  <div
                    className="app-sub-section-title"
                    style={{ backgroundColor: this.context.settings.primaryColor.light }}>
                    {this.context.getString(x[0])}
                  </div>
                  {x[1].map((y, j) => {
                    return (
                      <div className="app-item" key={"definitionItem" + j}>
                        <h5 className="win-h5">
                          <span>{j+1}. </span>
                          <span
                            className="app-link"
                            onClick={this.translate.bind(this, inputLang, outputLang, y[0])}>
                            {y[0]}
                          </span>
                        </h5>
                        {(y[2]) ? (
                          <h6 className="win-h6">
                            <span>"</span>
                            <span
                              className="app-item-secondary-word app-link"
                              onClick={this.translate.bind(this, inputLang, outputLang, y[2])}>
                              {y[2]}
                            </span>
                            <span>"</span>
                          </h6>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : null}
        {(inputDict[0]) ? (
          <div key="synonyms" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{ backgroundColor: this.context.settings.primaryColor.light }}>
              {this.context.getString("synonyms")}
            </div>
            {inputDict[0].map((x, i) => {
              return(
                <div className="app-sub-section" key={"synonymSubSection" + i}>
                  <div
                    className="app-sub-section-title"
                    style={{ backgroundColor: this.context.settings.primaryColor.light }}>
                    {this.context.getString(x[0])}
                  </div>
                  <ul className="app-list">
                    {x[1].map((wl, j) => {
                      return (
                        <li className="win-h6" key={"synonymLi" + j}>
                          {wl[0].map((word, k) => {
                            return (
                              <span key={"synonymSpan" + k}>
                                {(k > 0) ? (<span>, </span>) : null}
                                <span
                                  className="app-link win-h5"
                                  onClick={this.translate.bind(this, inputLang, outputLang, word)}>
                                  {word}
                                </span>
                              </span>
                            )
                          })}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        ) : null}
        {(inputDict[2]) ? (
          <div key="examples" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{ backgroundColor: this.context.settings.primaryColor.light }}>
              {this.context.getString("examples")}
            </div>
            <div className="app-sub-section">
              {inputDict[2][0].map((x, i) => {
                let text = x[0].replace(/(<([^>]+)>)/ig, "")
                return (
                  <div className="app-item" key={"exampleItem" + i}>
                    <h5 className="win-h5">
                      <span>{i+1}. </span>
                      <span
                        className="app-link"
                        onClick={this.translate.bind(this, inputLang, outputLang, text)}>
                        {text}
                      </span>
                    </h5>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
        {(inputDict[3]) ? (
          <div key="seeAlso" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{ backgroundColor: this.context.settings.primaryColor.light }}>
              {this.context.getString("see-also")}
            </div>
            <div className="app-sub-section">
              {inputDict[3].map((x, i) => {
                return (
                  <div className="app-item" key={"seeAlsoItem" + i}>
                    <h5 className="win-h5">
                      {x.map((y, j) => {
                        let text = y.replace(/(<([^>]+)>)/ig, "")
                        return (
                          <span key={"seeAlsoSpan" + j}>
                            {(j > 0) ? (<span>, </span>) : null}
                            <span
                              className="app-link win-h5"
                              onClick={this.translate.bind(this, inputLang, outputLang, text)}>
                              {text}
                            </span>
                          </span>
                        )
                      })}
                    </h5>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  render() {
    return (
      <Animation name="enterPage" className="app-dictionary-page">
        <ReactWinJS.Pivot className="win-type-body">
          {(this.props.outputObj && this.props.outputObj.outputDict) ? (
            <ReactWinJS.Pivot.Item key="outputDict" header={this.props.outputObj.outputText}>
              {this.renderOutputDict()}
            </ReactWinJS.Pivot.Item>
          ) : null}
          {(this.props.outputObj && this.props.outputObj.inputDict) ? (
            <ReactWinJS.Pivot.Item key="inputDict" header={this.props.inputObj.inputText}>
              {this.renderInputDict()}
            </ReactWinJS.Pivot.Item>
          ) : null}
        </ReactWinJS.Pivot>
      </Animation>
    )
  }
}
export default connectToStores(DictionaryPage)
