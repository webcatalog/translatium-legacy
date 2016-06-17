import React from "react"
import ReactWinJS from "react-winjs"
import connectToStores from "alt-utils/lib/connectToStores"
import Animation from "views/animation.js"
import OcrActions from "actions/ocr.js"
import OcrStore from "stores/ocr.js"
import TranslationActions from "actions/translation.js"

class OcrPage extends React.Component {
  static contextTypes = {
    settings: React.PropTypes.object,
    history: React.PropTypes.object,
    location: React.PropTypes.object,
    getString: React.PropTypes.func
  }

  static getStores() {
    return [OcrStore]
  }

  static getPropsFromStores() {
    return OcrStore.getState()
  }

  constructor() {
    super()
    this.state = {
      mode: "translated"
    }
  }

  zoomFitToWindow() {
    let w = (window.innerWidth / this.props.result.imgWidth * 0.9).toFixed(2)
    let h = (window.innerHeight / this.props.result.imgHeight * 0.9).toFixed(2)
    this.refs.zoomContainer.msContentZoomFactor = Math.min(w, h)
  }

  handleZoomInButtonClick() {
    this.refs.zoomContainer.msContentZoomFactor += 0.1
  }

  handleZoomOutButtonClick() {
    this.refs.zoomContainer.msContentZoomFactor -= 0.1
  }

  handleOpenSettingsAppButtonClick() {
    let uri = new Windows.Foundation.Uri("ms-settings:regionlanguage")
    return Windows.System.Launcher.launchUriAsync(uri)
  }

  handleToggleModeButtonClick() {
    this.setState({
      mode: (this.state.mode == "original") ? "translated" : "original"
    })
  }

  handleTryAgainButtonClick() {
    OcrActions.translate({
      outputLang: this.context.settings.outputLang
    })
  }

  handleOpenFromGalleryButtonClick() {
    let picker = new Windows.Storage.Pickers.FileOpenPicker()
    picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary
    picker.fileTypeFilter.append(".jpg")
    picker.fileTypeFilter.append(".jpeg")
    picker.fileTypeFilter.append(".png")
    picker.pickSingleFileAsync().then(file => {
      if (file) {
        OcrActions.recognizeAndTranslate({
          inputLang: this.context.settings.inputLang,
          outputLang: this.context.settings.outputLang,
          file
        })
      }
    })
  }

  handleCaptureButtonClick() {
    let dialog = new Windows.Media.Capture.CameraCaptureUI()
    return dialog.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(file => {
      if (file) {
        OcrActions.recognizeAndTranslate({
          inputLang: this.context.settings.inputLang,
          outputLang: this.context.settings.outputLang,
          file
        })
      }
    })
  }

  handleTextOnlyButtonClick() {
    TranslationActions.getTranslation({
      inputLang: this.context.settings.inputLang,
      outputLang: this.context.settings.outputLang,
      inputText: this.props.result.ocrResult.text,
      preferredProvider: this.context.settings.preferredProvider,
      instant: true
    })
    this.context.history.goBack()
  }

  componentDidUpdate(prevProps) {
    if (this.props.status == "translated") {
      this.zoomFitToWindow()
    }
  }

  componentDidMount() {
    if (this.props.status == "translated") {
      this.zoomFitToWindow()
    }
  }

  renderResult() {
    if (this.props.status == "noTextRecognized") {
      return (
        <div style={{ textAlign: "center", padding: 18 }}>
          <h2 className="win-h2">{this.context.getString("oops")}</h2>
          <h5 className="win-h5" style={{ marginTop: 12 }}>
            {this.context.getString("no-text-recognized")}
          </h5>
          <button
            className="win-button"
            style={{ marginTop: 12 }}
            onClick={this.handleCaptureButtonClick.bind(this)} >
            {this.context.getString("capture")}
          </button>
          <button
            className="win-button"
            style={{ marginTop: 12, marginLeft: 12 }}
            onClick={this.handleOpenFromGalleryButtonClick.bind(this)} >
            {this.context.getString("open-from-gallery")}
          </button>
        </div>
      )
    }
    else if (this.props.status == "failedToConnect") {
      return (
        <div style={{ textAlign: "center", padding: 18 }}>
          <h2 className="win-h2">{this.context.getString("oops")}</h2>
          <h4 className="win-h4">{this.context.getString("connect-problem")}</h4>
          <h5 className="win-h5" style={{ fontWeight: 400, marginTop: 12 }}>{this.context.getString("check-connect")}</h5>
          <h5 className="win-h5" style={{ fontWeight: 400 }}>{this.context.getString("no-connect-china-mode")}</h5>
          <button
            className="win-button"
            style={{ marginTop: 12 }}
            onClick={this.handleTryAgainButtonClick.bind(this)} >
            {this.context.getString("try-again")}
          </button>
        </div>
      )
    }
    if (this.props.status == "recognizing" || this.props.status == "translating" || this.props.status == "recognized") {
      return (<progress className="win-progress-ring win-large" style={{ marginLeft: "calc(50vw - 30px)", marginTop: "calc(50vh - 78px)" }} />)
    }
    else if (this.props.status == "translated") {
      let { imgHeight, imgWidth, ratio, ocrResult, translatedResult } = this.props.result
      let transformDeg = (ocrResult.textAngle) ? `rotate(-${ocrResult.textAngle}deg)` : null
      return (
        <div className="app-flex">
          <div className="app-zoom-container" ref="zoomContainer">
            <img
              src={window.URL.createObjectURL(this.props.file, { oneTimeOnly: true })}
              className="app-preview"
              style={{ transform: transformDeg }}/>
            <div className="app-text-overlay">
                {(this.state.mode == "original") ? ocrResult.lines.map(line => {
                  return line.words.map((word, i) => {
                    let top = Math.round(ratio * word.boundingRect.y) + "px"
                    let left = Math.round(ratio * word.boundingRect.x) + "px"
                    let fontSize = Math.round(ratio * word.boundingRect.height) + "px";

                    return (
                      <div
                        key={`word${i}`}
                        className="win-type-base app-word"
                        style={{ top, left, fontSize }}>
                        {word.text}
                      </div>
                    )
                  })
                }) : null}
                {(this.state.mode == "translated") ? translatedResult.map((line, i) => {
                  let top = Math.round(ratio * line.boundingRect.y) + "px"
                  let left = Math.round(ratio * line.boundingRect.x) + "px"
                  let fontSize = Math.round(ratio * line.boundingRect.height) + "px";

                  return (
                    <div
                      key={`line${i}`}
                      className="win-type-base app-word"
                      style={{ top, left, fontSize }}>
                      {line.text}
                    </div>
                  )
                }) : null}
            </div>
            <div className="app-bg-overlay" style={{ height: imgHeight, width: imgWidth, transform: transformDeg }} />
          </div>
          <ReactWinJS.ToolBar className="app-toolbar">
            <ReactWinJS.ToolBar.Button
              key="capture"
              icon="camera"
              label={this.context.getString("capture")}
              onClick={this.handleCaptureButtonClick.bind(this)}/>
            <ReactWinJS.ToolBar.Button
              key="openFromGallery"
              icon=""
              label={this.context.getString("open-from-gallery")}
              onClick={this.handleOpenFromGalleryButtonClick.bind(this)}/>
            <ReactWinJS.ToolBar.Button
                key="zoomOut"
                icon=""
                label={this.context.getString("zoom-out")}
                onClick={this.handleZoomOutButtonClick.bind(this)} />
            <ReactWinJS.ToolBar.Button
                key="zoomIn"
                icon=""
                label={this.context.getString("zoom-in")}
                onClick={this.handleZoomInButtonClick.bind(this)} />
            <ReactWinJS.ToolBar.Button
                key="toggleMode"
                section="secondary"
                label={(this.state.mode == "translated") ? this.context.getString("show-original") : this.context.getString("show-translated")}
                onClick={this.handleToggleModeButtonClick.bind(this)} />
            <ReactWinJS.ToolBar.Button
                key="textOnly"
                section="secondary"
                label={this.context.getString("text-only")}
                onClick={this.handleTextOnlyButtonClick.bind(this)} />
          </ReactWinJS.ToolBar>
        </div>
      )
    }
    return (<div/>)
  }

  render() {
    return (
      <Animation name="enterPage" className="app-ocr-page">
        {this.renderResult()}
      </Animation>
    )
  }
}

export default connectToStores(OcrPage)
