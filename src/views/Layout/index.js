import React from "react"
import ReactWinJS from "react-winjs"
import connectToStores from "alt-utils/lib/connectToStores"

import LanguageUtils from "utils/language.js"
import SettingStore from "stores/setting.js"
import SettingActions from "actions/setting.js"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"
import OcrActions from "actions/ocr.js"
import OcrStore from "stores/ocr.js"

import PassContext from './PassContext';

class Layout extends React.Component {
  static getStores() {
    return [SettingStore]
  }

  static getPropsFromStores() {
    return {
      settings: SettingStore.getState()
    }
  }

  constructor(props) {
    super(props)

    let mode = this.getMode()

    this.state = {
      mode: mode
    }

    this.handleBackClick = this.handleBackClick.bind(this)
    this.handleResize = this.handleResize.bind(this)
  }

  getChildContext() {
    return {
      history: this.props.history,
      location: this.props.location,
      settings: this.props.settings,
      getString: this.getString,
      overwriteHandleBackClick: this.overwriteHandleBackClick.bind(this),
      mode: this.state.mode
    }
  }

  setAppTheme(theme) {
    // Theme
    [`winjs/css/ui-${theme}.min.css`, `app-${theme}.min.css`].forEach(url => {
      let ss = document.styleSheets
      for (let i = 0, max = ss.length; i < max; i++) {
        if (ss[i].href == url)
          return
      }
      let link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = url
      document.getElementsByTagName("head")[0].appendChild(link)
    })
  }

  setAppColor(primaryColor) {
    let regCode = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(primaryColor.dark)
    let backgroundColor = {
      r: parseInt(regCode[1], 16),
      g: parseInt(regCode[2], 16),
      b: parseInt(regCode[3], 16),
      a: 1
    }
    let foregroundColor = { r: 255, g: 255, b: 255, a: 1 }

    // PC
  	if (Windows.UI.ViewManagement.ApplicationView) {
  	  let v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView()
  	  v.titleBar.backgroundColor = backgroundColor
  	  v.titleBar.foregroundColor = foregroundColor
  	  v.titleBar.buttonBackgroundColor = backgroundColor
  	  v.titleBar.buttonForegroundColor = foregroundColor
  	}

    if (Windows.UI.ViewManagement.StatusBar) {
      let statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView()
      statusBar.backgroundColor = backgroundColor
      statusBar.foregroundColor = foregroundColor
      statusBar.backgroundOpacity = 1
      if (this.props.settings.statusBar == true) {
        statusBar.showAsync()
      }
      else {
        statusBar.hideAsync()
      }
    }

  }

  getMode() {
    return (
      window.innerWidth >= 1024 ? "large" :
      window.innerWidth >= 600 ? "medium" :
      "small"
    )
  }

  getSplitViewConfig() {
    const splitViewConfigs = {
      small: {
        closedDisplayMode: "none",
        openedDisplayMode: "overlay"
      },
      medium: {
        closedDisplayMode: "inline",
        openedDisplayMode: "overlay"
      },
      large: {
        closedDisplayMode: "inline",
        openedDisplayMode: "overlay"
      }
    }
    return splitViewConfigs[this.state.mode]
  }

  getString(id, customParams) {
    let str = WinJS.Resources.getString(id).value
    let parameters = str.match(/{(.*?)}/g)
    if (parameters) {
      parameters.forEach(parameter => {
        let pId = parameter.substring(1, parameter.length - 1)
        if (isNaN(pId)) {
          let paramVal = (customParams && customParams[pId]) ? customParams[pId] : this.getString(pId)
          str = str.replace(parameter, paramVal)
        }
      })
    }
    return str
  }

  overwriteHandleBackClick(f) {
    this.customHandleBackClick = f
  }

  goBackHome() {
    if (this.props.location.pathname != '/') {
      this.props.history.goBack()
    }
  }

  handleResize() {
    let prevMode = this.state.mode
    let nextMode = this.getMode()

    if (prevMode !== nextMode) {
      this.setState({ mode: nextMode })
    }
  }

  handleBackClick(e) {
    if (this.customHandleBackClick) {
      this.customHandleBackClick()
      return true
    }
    if (this.props.location.pathname != '/') {
      this.props.history.goBack()
      return true
    }
  }

  handleBackButtonClick() {
    this.props.history.goBack()
  }

  handleTogglePaneInvoked() {
    this.setState({ paneOpened: !this.state.paneOpened })
  }

  handlePaneAfterClose() {
    this.state.paneOpened = false
  }

  handleCommandInvoked(pathId) {
    let pathName = "/" + pathId
    if ((pathName == this.props.location.pathname)
      || ((this.props.location.pathname != "/") && (pathName != "/"))) {
      this.props.history.replace(pathName);
    }
    else {
      this.props.history.push(pathName)
    }
    this.setState({
      paneOpened: this.getSplitViewConfig().openedDisplayMode === "overlay" ? false : this.state.paneOpened
    })

  }

  handleLanguageTitleClick(type) {
    this.props.history.push({
      pathname: "/choose-a-language",
      query: { type }
    })
  }

  handleSwapButtonClick() {
    let inputLang = this.props.settings.outputLang
    let outputLang = (this.props.settings.inputLang == "zh") ? "zh-CN" : this.props.settings.inputLang
    SettingActions.setValues({ inputLang, outputLang })

   TranslationActions.getTranslation({
      inputLang: inputLang,
      outputLang: outputLang,
      preferredProvider: this.props.settings.preferredProvider,
      instant: false
    })
  }

  handleOcrSwapButtonClick() {
    let inputLang = this.props.settings.outputLang
    let outputLang = (this.props.settings.inputLang == "zh") ? "zh-CN" : this.props.settings.inputLang
    SettingActions.setValue({ name: "inputLang", value: inputLang })
    SettingActions.setValue({ name: "outputLang", value: outputLang })

    OcrActions.recognizeAndTranslate({
      inputLang: inputLang,
      outputLang: outputLang,
      file: OcrStore.getState().file
    })
  }

  componentWillMount() {
    this.setAppTheme(this.props.settings.theme)
    this.setAppColor(this.props.settings.primaryColor)
  }

  componentDidMount() {
    WinJS.Application.addEventListener("backclick", this.handleBackClick)
    window.addEventListener("resize", this.handleResize)
    window.goBackHome = this.goBackHome.bind(this)
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.settings.theme != nextProps.settings.theme) {
      this.setAppTheme(nextProps.settings.theme)
    }

    if ((this.props.settings.primaryColor.light != nextProps.settings.primaryColor.light)
     || (this.props.settings.primaryColor.dark != nextProps.settings.primaryColor.dark)) {
      this.setAppColor(nextProps.settings.primaryColor)
    }
  }

  componentWillUnmount() {
    WinJS.Application.removeEventListener("backclick", this.handleBackClick)
    window.removeEventListener("resize", this.handleResize)
    window.goBackHome = null
  }

  renderBackButton() {
    let canGoBack = (this.props.location.pathname != "/")
    let shouldShowBackButton = canGoBack
    return shouldShowBackButton ?
      (
        <button
          className="win-backbutton app-button"
          onClick={this.handleBackButtonClick.bind(this)} />
      )
    : null
  }

  renderTitle() {
    if (this.props.location.pathname == "/") {
      return (
        <div>
          <h4 className="win-h4 app-language-title"
              onClick={this.handleLanguageTitleClick.bind(this, "input")}>
            {this.getString(`/languages/${this.props.settings.inputLang}`)}
          </h4>
          <button
            className="win-backbutton app-button app-icon"
            data-icon=""
            disabled={(!LanguageUtils.outputSupported(this.props.settings.inputLang))}
            onClick={this.handleSwapButtonClick.bind(this)} />
          <h4 className="win-h4 app-language-title"
              onClick={this.handleLanguageTitleClick.bind(this, "output")}>
            {this.getString(`/languages/${this.props.settings.outputLang}`)}
          </h4>
        </div>
      )
    }
    if (this.props.location.pathname == "/ocr") {
      return (
        <div className="app-ocr-top">
          <h4 className="win-h4 app-language-title"
              onClick={this.handleLanguageTitleClick.bind(this, "input-ocr")}>
            {this.getString(`/languages/${this.props.settings.inputLang}`)}
          </h4>
          <button
            className="win-backbutton app-button app-icon"
            data-icon=""
            disabled={(!LanguageUtils.ocrSupported(this.props.settings.outputLang))}
            onClick={this.handleOcrSwapButtonClick.bind(this)} />
          <h4 className="win-h4 app-language-title"
              onClick={this.handleLanguageTitleClick.bind(this, "output-ocr")}>
            {this.getString(`/languages/${this.props.settings.outputLang}`)}
          </h4>
        </div>
      )
    }
    return (
      <h4 className="win-h4 app-title">
        {this.getString(this.props.location.pathname.slice(1))}
      </h4>
    )
  }

  render() {
    let paneComponent = (
      <div>
        <ReactWinJS.SplitView.Command
          label={this.getString("home")}
          icon="home"
          onInvoked={this.handleCommandInvoked.bind(this, "")} />
        <ReactWinJS.SplitView.Command
          label={this.getString("favorites")}
          icon=""
          onInvoked={this.handleCommandInvoked.bind(this, "favorites")} />
        <ReactWinJS.SplitView.Command
          style={{position: "absolute", bottom: 48, width: "100%"}}
          label={this.getString("settings")}
          icon="settings"
          onInvoked={this.handleCommandInvoked.bind(this, "settings")} />
        <ReactWinJS.SplitView.Command
          style={{position: "absolute", bottom: 0, width: "100%"}}
          label={this.getString("about")}
          icon="help"
          onInvoked={this.handleCommandInvoked.bind(this, "about")} />
      </div>
    )

    return (
      <div className="win-type-body app-layout">
        <div style={{backgroundColor: this.props.settings.primaryColor.light}} className="win-ui-dark app-topbar">
          <ReactWinJS.SplitViewPaneToggle
            aria-controls="rootSplitView"
            className="app-menu-button"
            paneOpened={this.state.paneOpened}
            onInvoked={this.handleTogglePaneInvoked.bind(this)} />
          {this.renderBackButton()}
          {this.renderTitle()}
        </div>
        <ReactWinJS.SplitView
          id="rootSplitView"
          className="app-splitview"
          style={{height: "100%"}}
          paneComponent={paneComponent}
          contentComponent={(
            <PassContext context={this.getChildContext()} className="app-pass-context">
              {this.props.children}
            </PassContext>
          )}
          onAfterClose={this.handlePaneAfterClose.bind(this)}
          paneOpened={this.state.paneOpened}
          {...this.getSplitViewConfig()} />
       </div>
     )
  }
}

Layout.childContextTypes = {
  history: React.PropTypes.object,
  location: React.PropTypes.object,
  settings: React.PropTypes.object,
  getString: React.PropTypes.func,
  overwriteHandleBackClick: React.PropTypes.func,
  mode: React.PropTypes.string,
};


export default connectToStores(Layout)
