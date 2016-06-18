import React from "react"
import ReactWinJS from "react-winjs"
import LanguageUtils from "utils/language.js"
import TranslationActions from "actions/translation.js"
import TranslationStore from "stores/translation.js"
import OcrActions from "actions/ocr.js"
import TTSUtils from "utils/tts.js"

class InputToolbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playing: false
    }
  }

  handleClearAllButtonClick() {
    TranslationActions.clearTranslation()
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
        this.context.history.push("/ocr")
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
        this.context.history.push("/ocr")
      }
    })
  }

  handleExpandButtonClick() {
    this.context.toggleExpanded()
  }

  handleListenButtonClick() {
    if (this.state.playing == true) {
      TTSUtils.stop();
      this.setState({ playing: false });
      return;
    }

    let { inputObj } = TranslationStore.getState()
    if (!inputObj || !inputObj.inputText) return
    this.setState({ playing: true })
    TTSUtils.ttsText(this.context.settings.inputLang, inputObj.inputText)
      .then(() => {
        this.setState({ playing: false })
      })
      .catch(err => {
        let title = this.context.getString("connect-problem");
        let content = this.context.getString("check-connect");
        let msg = new Windows.UI.Popups.MessageDialog(content, title);
        msg.showAsync().done();
        this.setState({ playing: false })
      });
  }

  handleSpeakButtonClick() {
    this.props.changeInputMode("speak")
  }

  handleWriteButtonClick() {
    this.props.changeInputMode("write")
  }

  handlePinLanguagePairButtonClick() {
    let { inputLang, outputLang } = this.context.settings
    let tileId = inputLang + "_" + outputLang

    if (Windows.UI.StartScreen.SecondaryTile.exists(tileId)) {
      let tileId = this.context.settings.inputLang + "_" + this.context.settings.outputLang
      let tileToDelete = new Windows.UI.StartScreen.SecondaryTile(tileId)
      return tileToDelete.requestDeleteAsync().then(() => {
        this.setState({})
      }, () => {
        this.setState({})
      })
    }

    let tileActivationArguments = "tile_shortcut";
    let newTileDisplayName = `${this.context.getString(`/languages/${inputLang}`)} <> ${this.context.getString(`/languages/${outputLang}`)}`;

    let square150x150Logo = new Windows.Foundation.Uri("ms-appx:///images/Square150x150.png")
    let wide310x150Logo = new Windows.Foundation.Uri("ms-appx:///images/Wide310x150.png")
    let square310x310Logo = new Windows.Foundation.Uri("ms-appx:///images/Square310x310.png")

    let newTileDesiredLogo = square150x150Logo
    let newTileDesiredSize = Windows.UI.StartScreen.TileSize.square150x150
    let tile = new Windows.UI.StartScreen.SecondaryTile(
      tileId,
      newTileDisplayName,
      tileActivationArguments + tileId,
      newTileDesiredLogo,
      newTileDesiredSize
    )
    tile.visualElements.showNameOnSquare150x150Logo = true
    tile.visualElements.foregroundText = Windows.UI.StartScreen.ForegroundText.light
    tile.visualElements.showNameOnWide310x150Logo = true
    tile.visualElements.wide310x150Logo = wide310x150Logo
    tile.visualElements.showNameOnSquare310x310Logo = true
    tile.visualElements.square310x310Logo = square310x310Logo

    this.setState({})
    return tile.requestCreateAsync().then(() => {
      this.setState({})
    }, () => {
      this.setState({})
    })
  }

  render() {
    let tileExisted = (Windows.UI.StartScreen.SecondaryTile.exists(this.context.settings.inputLang + "_" + this.context.settings.outputLang))
    return (
      <div className="app-toolbar-container">
        <ReactWinJS.ToolBar ref="toolBar">
          <ReactWinJS.ToolBar.Button
            key="clearAll"
            icon=""
            label={this.context.getString("clear-all")}
            onClick={this.handleClearAllButtonClick.bind(this)}/>
          <ReactWinJS.ToolBar.Button
            key="listen"
            icon={this.state.playing ? "" : ""}
            hidden={!(LanguageUtils.listenSupported(this.context.settings.inputLang))}
            label={this.context.getString("listen")}
            onClick={this.handleListenButtonClick.bind(this)}/>
          <ReactWinJS.ToolBar.Button
            key="speak"
            icon="microphone"
            hidden={!(LanguageUtils.speakSupported(this.context.settings.inputLang))}
            label={this.context.getString("speak")}
            onClick={this.handleSpeakButtonClick.bind(this)}/>
          <ReactWinJS.ToolBar.Button
            key="write"
            icon=""
            hidden={!(LanguageUtils.writeSupported(this.context.settings.inputLang))}
            label={this.context.getString("write")}
            onClick={this.handleWriteButtonClick.bind(this)}/>
          <ReactWinJS.ToolBar.Button
            key="capture"
            icon="camera"
            hidden={!(LanguageUtils.ocrSupported(this.context.settings.inputLang))}
            label={this.context.getString("capture")}
            onClick={this.handleCaptureButtonClick.bind(this)}/>
          <ReactWinJS.ToolBar.Button
            key="openFromGallery"
            icon=""
            hidden={!(LanguageUtils.ocrSupported(this.context.settings.inputLang))}
            label={this.context.getString("open-from-gallery")}
            onClick={this.handleOpenFromGalleryButtonClick.bind(this)}/>
          <ReactWinJS.ToolBar.Button
            key="expand"
            icon={this.context.expanded ? "": ""}
            label={this.context.expanded ? this.context.getString("collapse") : this.context.getString("expand")}
            onClick={this.handleExpandButtonClick.bind(this)}/>
          <ReactWinJS.ToolBar.Button
            key="pinLanguagePair"
            section="secondary"
            label={(tileExisted) ? this.context.getString("unpin-language-pair") : this.context.getString("pin-language-pair")}
            onClick={this.handlePinLanguagePairButtonClick.bind(this)}/>
        </ReactWinJS.ToolBar>
      </div>
    )
  }
}

InputToolbar.contextTypes = {
  settings: React.PropTypes.object,
  getString: React.PropTypes.func,
  history: React.PropTypes.object,
  expanded: React.PropTypes.bool,
  toggleExpanded: React.PropTypes.func,
};


export default InputToolbar;
