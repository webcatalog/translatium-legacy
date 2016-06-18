import React from "react"
import ReactWinJS from "react-winjs"
import connectToStores from "alt-utils/lib/connectToStores"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"
import SettingActions from "actions/setting.js"
import TTSUtils from "utils/tts.js"
import LanguageUtils from "utils/language.js"
import Dictionary from "./dictionary.js"

class OutputCard extends React.Component {
  static getStores() {
    return [TranslationStore]
  }

  static getPropsFromStores() {
    return TranslationStore.getState()
  }

  constructor(props) {
    super(props)
    this.state = {
      playing: false
    }
  }

  handleTryAgainButtonClick(inputObj) {
    TranslationActions.getTranslation(inputObj)
  }

  copyToClipboard(text) {
    let dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage()
    dataPackage.setText(text)
    Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage)
  }

  share(text) {
    let dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView()
    dataTransferManager.ondatarequested = e => {
      let request = e.request
      request.data.properties.title = "\0"
      request.data.properties.description = "\0"
      request.data.setText(text)
      dataTransferManager.ondatarequested = null
    }
    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI()
  }

  handleCopyToClipboardButtonClick(e) {
    let menu = new Windows.UI.Popups.PopupMenu()
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        WinJS.Resources.getString("original-text").value,
        () => { this.copyToClipboard(this.props.inputObj.inputText) }
      )
    )
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        WinJS.Resources.getString("translated-text").value,
        () => { this.copyToClipboard(this.props.outputObj.outputText) }
      )
    )
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        WinJS.Resources.getString("both").value,
        () => { this.copyToClipboard(this.props.inputObj.inputText + "\r\n" + this.props.outputObj.outputText) }
      )
    )
    let zoomFactor = document.documentElement.msContentZoomFactor
    return menu.showAsync({
      x: (e.pageX - window.pageXOffset) * zoomFactor,
      y: (e.pageY - window.pageYOffset) * zoomFactor
    }).done()
  }

  handleShareButtonClick(e) {
    let menu = new Windows.UI.Popups.PopupMenu()
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        WinJS.Resources.getString("original-text").value,
        () => { this.share(this.props.inputObj.inputText) }
      )
    )
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        WinJS.Resources.getString("translated-text").value,
        () => { this.share(this.props.outputObj.outputText) }
      )
    )
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        WinJS.Resources.getString("both").value,
        () => { this.share(this.props.inputObj.inputText + "\r\n" + this.props.outputObj.outputText) }
      )
    )
    let zoomFactor = document.documentElement.msContentZoomFactor
    return menu.showAsync({
      x: (e.pageX - window.pageXOffset) * zoomFactor,
      y: (e.pageY - window.pageYOffset) * zoomFactor
    }).done()
  }

  handleListenButtonClick() {
    if (this.state.playing == true) {
      TTSUtils.stop();
      this.setState({ playing: false });
      return;
    }

    this.setState({ playing: true })
    TTSUtils.ttsText(this.context.settings.outputLang, this.props.outputObj.outputText)
      .then(() => {
        this.setState({ playing: false })
      }, err => {
        this.setState({ playing: false })
        if (err.name != "Canceled") {
          let title = this.context.getString("connect-problem")
          let content = this.context.getString("check-connect")
          let msg = new Windows.UI.Popups.MessageDialog(content, title)
          return msg.showAsync().done()
        }
      })
  }

  handleBigTextButtonClick() {
    this.context.history.push("/big-text")
  }

  handleSuggestedInputTextClick() {
    TranslationActions.getTranslation({ inputText: this.props.outputObj.suggestedInputText })
  }

  handleSuggestedInputLangClick() {
    if (this.props.outputObj.suggestedInputLang == this.context.settings.outputLang) {
      let inputLang = this.props.outputObj.suggestedInputLang
      let outputLang = (this.context.settings.inputLang == "zh") ? "zh-CN" : this.context.settings.inputLang
      SettingActions.setValue({ name: "inputLang", value: inputLang })
      SettingActions.setValue({ name: "outputLang", value: outputLang })
      TranslationActions.getTranslation({ inputLang, outputLang })
      return
    }

    SettingActions.setValue({ name: "inputLang", value: this.props.outputObj.suggestedInputLang })
    TranslationActions.getTranslation({ inputLang: this.props.outputObj.suggestedInputLang })
  }

  handleDetectedInputLangClick() {
    SettingActions.setValue({ name: "inputLang", value: this.props.outputObj.detectedInputLang })
    TranslationActions.getTranslation({ inputLang: this.props.outputObj.detectedInputLang })
  }

  handleAddToFavoritesButtonClick() {
    if (this.props.favoriteId) return TranslationActions.removeFromFavorites()
    return TranslationActions.addToFavorites()
  }

  handleSwapButtonClick() {
    let inputLang = this.context.settings.outputLang
    let outputLang = (this.context.settings.inputLang == "zh") ? "zh-CN" : this.context.settings.inputLang
    SettingActions.setValue({ name: "inputLang", value: inputLang })
    SettingActions.setValue({ name: "outputLang", value: outputLang })

    TranslationActions.getTranslation({
      inputLang, outputLang,
      inputText: this.props.outputObj.outputText
    })
  }

  replaceWithJSX(str, param, jsx) {
    let n = str.indexOf(param)
    let res = []
    res.push(str.slice(0, n))
    res.push(jsx)
    res.push(str.slice(n + param.length, str.length - 1))
    return res
  }

  openURI(uriStr) {
    let uri = new Windows.Foundation.Uri(uriStr)
    return Windows.System.Launcher.launchUriAsync(uri)
  }

  renderSuggestion() {
    if (this.props.status == "successful") {
      if (this.props.inputObj.inputLang == "auto") {
        return (
          <div className="app-suggestion win-h5">
            {this.replaceWithJSX(
              this.context.getString("language-detected"),
              "{1}",
              (
                <span
                  className="app-hl"
                  style={{ color: this.context.settings.primaryColor.light }}
                  onClick={this.handleDetectedInputLangClick.bind(this)}>
                  {this.context.getString(`/languages/${this.props.outputObj.detectedInputLang}`)}
                </span>
              )
            )}
          </div>
        )
      }
      if (this.props.outputObj.suggestedInputText) {
        return (
          <div className="app-suggestion win-h5">
            {this.replaceWithJSX(
              this.context.getString("did-you-mean"),
              "{1}",
              (
                <span
                  className="app-hl"
                  style={{ color: this.context.settings.primaryColor.light }}
                  onClick={this.handleSuggestedInputTextClick.bind(this)}>
                  {this.props.outputObj.suggestedInputText}
                </span>
              )
            )}
          </div>
        )
      }
      if ((this.props.outputObj.suggestedInputLang) &&
          (LanguageUtils.countryRemoved(this.props.outputObj.suggestedInputLang)
          != LanguageUtils.countryRemoved(this.context.settings.inputLang))) {
        return (
          <div className="app-suggestion win-h5">
            {this.replaceWithJSX(
              this.context.getString("translate-from"),
              "{1}",
              (
                <span
                  className="app-hl"
                  style={{ color: this.context.settings.primaryColor.light }}
                  onClick={this.handleSuggestedInputLangClick.bind(this)}>
                  {this.context.getString(`/languages/${this.props.outputObj.suggestedInputLang}`)}
                </span>
              )
            )}
          </div>
        )
      }
    }
    return null
  }

  renderCard() {
    if (this.props.status == "failed") {
      let inputObj = this.props.inputObj
      return (
        <div style={{ textAlign: "center", padding: 18 }}>
          <h2 className="win-h2">{this.context.getString("oops")}</h2>
          <h4 className="win-h4">{this.context.getString("connect-problem")}</h4>
          <h5 className="win-h5" style={{ fontWeight: 400, marginTop: 12 }}>{this.context.getString("check-connect")}</h5>
          <h5 className="win-h5" style={{ fontWeight: 400 }}>{this.context.getString("no-connect-china-mode")}</h5>
          <button
            className="win-button"
            style={{ marginTop: 12 }}
            onClick={this.handleTryAgainButtonClick.bind(this, inputObj)} >
            {this.context.getString("try-again")}
          </button>
        </div>
      )
    }
    else if (this.props.status == "loading") {
      return (<progress className="win-progress-ring win-large" style={{ marginLeft: "calc(50vw - 30px)" }} />)
    }
    else if (this.props.status == "successful") {
      return (
        <div className="app-card">
          <ReactWinJS.ToolBar>
            <ReactWinJS.ToolBar.Button
              key="listen"
              icon={this.state.playing ? "" : ""}
              hidden={!(LanguageUtils.listenSupported(this.context.settings.outputLang))}
              label={this.context.getString("listen")}
              onClick={this.handleListenButtonClick.bind(this)}/>
            <ReactWinJS.ToolBar.Button
              key="big-text"
              icon=""
              label={this.context.getString("big-text")}
              onClick={this.handleBigTextButtonClick.bind(this)}/>
            <ReactWinJS.ToolBar.Button
              key="swap"
              icon=""
              label={this.context.getString("swap")}
              onClick={this.handleSwapButtonClick.bind(this)}/>
            <ReactWinJS.ToolBar.Button
              key="copyToClipboard"
              icon=""
              label={this.context.getString("copy-to-clipboard")}
              onClick={this.handleCopyToClipboardButtonClick.bind(this)}/>
            <ReactWinJS.ToolBar.Button
              key="share"
              icon=""
              label={this.context.getString("share")}
              onClick={this.handleShareButtonClick.bind(this)}/>
            <ReactWinJS.ToolBar.Button
              key="addToFavorites"
              icon={(this.props.favoriteId) ? "" : ""}
              label={(this.props.favoriteId) ? this.context.getString("remove-from-favorites") : this.context.getString("add-to-favorites")}
              onClick={this.handleAddToFavoritesButtonClick.bind(this)}/>
          </ReactWinJS.ToolBar>
          <h4 className="win-h4 app-output-text app-allow-select-text" lang={this.props.inputObj.outputLang}>
            {this.props.outputObj.outputText}
          </h4>
          {this.props.outputObj.outputRoman ? (
            <h6 className="win-h6 app-output-roman app-allow-select-text" lang={this.props.inputObj.outputLang}>
              {this.props.outputObj.outputRoman}
            </h6>
          ) : null}
        </div>
      )
    }
    return <div/>
  }

  renderInfo() {
    if (this.props.status == "successful") {
      return (
        <div className="app-note">
          <h6 className="win-h6">
            {(() => {
              if (this.props.loadedFrom == "favorites") return this.context.getString("loaded-from-favorites")
              return this.context.getString("real-time")
            })()}
          </h6>
          {(this.props.outputObj.provider) ? (
            <h6 className="win-h6">
              <span>{this.context.getString("translated-by")} </span>
              <b>{this.props.outputObj.provider}</b>
            </h6>
          ): null}
        </div>
      )
    }
    return null
  }

  render() {
    return (
      <div className="app-translation-card-container">
        {this.renderSuggestion()}
        {this.renderCard()}
        <Dictionary/>
        {this.renderInfo()}
      </div>
    )
  }
}

OutputCard.contextTypes = {
  getString: React.PropTypes.func,
  settings: React.PropTypes.object,
  history: React.PropTypes.object,
};

export default connectToStores(OutputCard);
