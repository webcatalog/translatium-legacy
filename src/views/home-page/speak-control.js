import React from "react"
import ReactWinJS from "react-winjs"
import ReactMixin from "react-mixin"
import ReactOnClickOutside from "react-onclickoutside"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"

class SpeakControl extends React.Component {
  static contextTypes = {
    getString: React.PropTypes.func,
    settings: React.PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = {
      status: "none"
    }

    this.initDevice()

    this.releaseDevice = this.releaseDevice.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentWillUnmount() {
    this.releaseDevice()
  }

  initDevice() {
    this.captureInitSettings = null
    this.captureInitSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings()
    this.captureInitSettings.audioDeviceId = ""
    this.captureInitSettings.videoDeviceId = ""
    this.captureInitSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audio
    this.systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView()
  }

  releaseDevice() {
    if (this.state.status == "recording" || this.mediaCaptureMgr != null) {
      clearInterval(this.checkTime)
      this.state.status = "none"
      if (this.mediaCaptureMgr) {
        this.mediaCaptureMgr.close()
        this.mediaCaptureMgr = null
      }
      WinJS.Application.removeEventListener("checkpoint", this.releaseDevice)
      this.systemMediaControls.onpropertychanged = null
    }
  }

  startRecording() {
    if (this.mediaCaptureMgr == null) {
      this.mediaCaptureMgr = new Windows.Media.Capture.MediaCapture()
      WinJS.Application.addEventListener("checkpoint", this.releaseDevice)
      this.systemMediaControls.onpropertychanged = (e) => {
        if (e.property === Windows.Media.SystemMediaTransportControlsProperty.soundLevel) {
          if (e.target.soundLevel === Windows.Media.SoundLevel.muted) {
            this.releaseDevice()
          }
          else {
            this.initDevice()
          }
        }
      }
    }

    this.setState({ status: "recording" })

    this.mediaCaptureMgr.initializeAsync(this.captureInitSettings)
      .then(() => {
        this.checkTime = setInterval(() => {
          this.stopRecording()
        }, 10000)
        let encodingProfile = Windows.Media.MediaProperties.MediaEncodingProfile.createWav(
                                Windows.Media.MediaProperties.AudioEncodingQuality.auto
                              )
        encodingProfile.audio.sampleRate = 16000
        encodingProfile.audio.channelCount = 1
        this.soundStream = new Windows.Storage.Streams.InMemoryRandomAccessStream()
        return this.mediaCaptureMgr.startRecordToStreamAsync(encodingProfile, this.soundStream)
      })
      .then(null, err => {
      })
  }

  stopRecording() {
    clearInterval(this.checkTime)
    if (this.state.status == "recording") {
      this.setState({ status: "recognizing" })
      this.mediaCaptureMgr.stopRecordAsync()
        .then(() => {
          this.mediaCaptureMgr.close()
          this.mediaCaptureMgr = null
          WinJS.Application.removeEventListener("checkpoint", this.releaseDevice)
          this.systemMediaControls.onpropertychanged = null
          let blob = MSApp.createBlobFromRandomAccessStream("audio/l16", this.soundStream)
          this.soundStream = null
          let url = "https://www.google.com/speech-api/v2/recognize?output=json&lang="
                      + this.context.settings.inputLang + "&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw"
          if (this.promise) this.promise.cancel()
          this.promise = WinJS.xhr({
            type: "POST",
            url: url,
            data: blob,
            headers: {
                "Content-Type": "audio/l16; rate=16000"
            }
          }).then(
            result => {
              this.setState({ status: "none "})
              let response = result.response
              if (response.length > 14) {
                response = response.substring(14, response.length)
                let spres = JSON.parse(response).result[0].alternative[0].transcript

                let inputObj = TranslationStore.getState().inputObj
                let inputText = (inputObj) ? (inputObj.inputText + " " + spres) : spres
                TranslationActions.getTranslation({
                  inputLang: this.context.settings.inputLang,
                  outputLang: this.context.settings.outputLang,
                  inputText,
                  noLoad: (this.context.settings.realTime == false)
                })
              }
            },
            () => {
              let title = this.context.getString("connect-problem")
              let content = this.context.getString("check-connect")
              let msg = new Windows.UI.Popups.MessageDialog(content, title)
              msg.showAsync().done()
              this.setState({ status: "none "})
            }
        )
      })
    }
  }

  handleClickOutside() {
    this.props.changeInputMode(null)
  }

  handleControlButtonClick() {
    if (this.state.status == "recording") this.stopRecording()
    else this.startRecording()
  }

  render() {
    return(
      <div className={(this.state.status == "recording") ? "app-speak-control active" : "app-speak-control"}>
        {(this.state.status == "recognizing")
        ? (
          <progress className="win-progress-bar app-progress"></progress>
        ) :
          (
            <div>
              <div className="app-control-button" onClick={this.handleControlButtonClick.bind(this)}>
                  {(this.state.status == "recording") ? "" : ""}
              </div>
              <div className="app-wave" />
              <div className="app-wave-2"/>
              <div className="app-tips">
                <h4 className="win-h4">
                  {(this.state.status == "recording") ? this.context.getString("tap-to-stop-recording") : this.context.getString("tap-to-start-recording")}
                </h4>
              </div>
            </div>
          )}
      </div>
    )
  }
}
ReactMixin(SpeakControl.prototype, ReactOnClickOutside)
export default SpeakControl
