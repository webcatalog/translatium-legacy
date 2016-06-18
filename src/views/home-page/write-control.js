import React from "react"
import ReactWinJS from "react-winjs"
import ReactMixin from "react-mixin"
import onClickOutside from "react-onclickoutside"
import TranslationStore from "stores/translation.js"
import TranslationActions from "actions/translation.js"

const defaultList = [",", ".", "?", "!", ":", "'", "\"", ";", "@"]

class WriteControl extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      recognizing: false,
      list: new WinJS.Binding.List(defaultList)
    }
    this.clickInk = new Array()
    this.clickX = new Array()
    this.clickY = new Array()
    this.clickZ = new Array()
    this.clickDrag = new Array()
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.handleResize = this.handleResize.bind(this)
  }

  itemRenderer = ReactWinJS.reactRenderer(item => {
    return (
      <div className="win-h4 app-item">
        {item.data}
      </div>
    )
  })

  handleMouseDown(e) {
    this.paint = true
    let pageX, pageY
    if (e.type == "touchstart") {
      let touch = e.touches[0]
      pageX = touch.pageX
      pageY = touch.pageY
    }
    else {
      pageX = e.pageX
      pageY = e.pageY
    }
    this.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop)
  }

  handleMouseMove(e) {
    if (this.paint) {
      let pageX, pageY
      if (e.type == "touchmove") {
        let touch = e.touches[0]
        pageX = touch.pageX
        pageY = touch.pageY
      }
      else {
        pageX = e.pageX
        pageY = e.pageY
      }
      this.addClick(pageX - this.offsetLeft, pageY - this.offsetTop, true)
    }
  }

  handleMouseUp(e) {
    this.paint = false
    this.clickInk.push([this.clickX, this.clickY, this.clickZ])
    this.clickX = new Array()
    this.clickY = new Array()
    this.clickZ = new Array()
    this.recognizeHandwriting()
  }

  handleMouseLeave(e) {
    this.paint = false
  }

  handleResize() {
    this.props.changeInputMode(null)
  }

  addClick(x, y, dragging) {
    this.clickX.push(Math.round(x))
    this.clickY.push(Math.round(y))
    this.clickDrag.push(dragging)
    let time = new Date().getTime()
    this.clickZ.push(time - this.startTime)
    let i = this.clickX.length - 1
    this.canvasContext.beginPath()
    if (this.clickDrag[i] && i) this.canvasContext.moveTo(this.clickX[i - 1], this.clickY[i - 1])
    else this.canvasContext.moveTo(this.clickX[i] - 1, this.clickY[i])
    this.canvasContext.lineTo(this.clickX[i], this.clickY[i])
    this.canvasContext.closePath()
    this.canvasContext.stroke()
  }

  recognizeHandwriting() {
    if (this.promise) this.promise.cancel()
    this.promise = WinJS.Promise.as()
      .then(() => {
        let url = "https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8"
        let data = {
          "device": "Mozilla/5.0 (Linux; Android 4.0.4; GT-i9100 Build/IML74K) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.49 Mobile Safari/537.31 ApiKey/1.257",
          "options": "enable_pre_space",
          "requests": [
            {
              "writing_guide": {
                "writing_area_width": this.canvasContext.canvas.width,
                "writing_area_height": this.canvasContext.canvas.height
              },
              "ink": this.clickInk,
              "language": this.context.settings.inputLang
            }
          ]
        }
        return WinJS.xhr({
          type: "post",
          url: url,
          headers: {
              'Content-Type': 'application/json'
          },
          data: JSON.stringify(data)
        })
      })
      .then(response => {
        if (response) {
          return JSON.parse(response.response)[1][0][1]
        }
      })
      .then(result => {
        if (result.length > 0) {
          let inputObj = TranslationStore.getState().inputObj
          let inputText
          if (this.result) {
            inputText = inputObj.inputText.slice(0, -this.result[0].length) + result[0]
          }
          else {
            inputText = (inputObj) ? (inputObj.inputText + result[0]) : result[0]
          }
          TranslationActions.getTranslation({
            inputLang: this.context.settings.inputLang,
            outputLang: this.context.settings.outputLang,
            inputText,
            noLoad: (this.context.settings.realTime == false)
          })

          this.result = result
          this.setState({ list: new WinJS.Binding.List(result) })

        }
      }).then(null, err => {
        if (err.name != "Canceled") {
          let title = this.context.getString("connect-problem")
          let content = this.context.getString("check-connect")
          let msg = new Windows.UI.Popups.MessageDialog(content, title)
          msg.showAsync().done()
        }
      })
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize)

    let { canvas } = this.refs
    this.canvasContext = canvas.getContext("2d")
    this.canvasContext.canvas.height = canvas.clientHeight
    this.canvasContext.canvas.width = canvas.clientWidth
    this.canvasContext.strokeStyle = (this.context.settings.theme == "light") ? "#000" : "#fff"
    this.canvasContext.lineJoin = "round"
    this.canvasContext.lineWidth = 5
    this.offsetTop = canvas.offsetParent.offsetTop + canvas.offsetTop + 48
    this.offsetLeft = canvas.offsetParent.offsetLeft + canvas.offsetLeft + ((this.context.mode == "small") ? 0 : 48)
  }

  componentWillUnmount() {
    if (this.promise) this.promise.cancel()
    window.removeEventListener("resize", this.handleResize)
  }

  clearCanvas() {
    if (this.clickInk.length < 1) return
    this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height)
    this.clickInk = new Array()
    this.clickX = new Array()
    this.clickY = new Array()
    this.clickZ = new Array()
    this.clickDrag = new Array()
    this.startTime = new Date().getTime()
    this.paint = false
    this.result = null

    this.setState({ list: new WinJS.Binding.List(defaultList) })
  }

  handleDeleteButtonClick() {
    let inputObj = TranslationStore.getState().inputObj

    let delLength = (this.result) ? this.result[0].length : 1

    if (inputObj && inputObj.inputText.length - delLength >= 0) {
      let inputText = inputObj.inputText.slice(0, -delLength)
      TranslationActions.getTranslation({ inputText, noLoad: (this.context.settings.realTime == false) })
    }

    this.clearCanvas()
  }

  handleDoneButtonClick() {
    this.clearCanvas()
  }

  handleSpaceBarButtonClick() {
    let inputObj = TranslationStore.getState().inputObj
    let inputText = (inputObj) ? inputObj.inputText + " " : " "
    TranslationActions.getTranslation({ inputText, noLoad: (this.context.settings.realTime == false) })
    this.clearCanvas()
  }

  handleItemInvoked(e) {
    let rText = this.state.list.getAt(e.detail.itemIndex)
    let inputObj = TranslationStore.getState().inputObj

    let inputText
    if (this.result) {
      inputText = inputObj.inputText.slice(0, -this.result[0].length) + rText
    }
    else {
      inputText = (inputObj) ? inputObj.inputText + rText : rText
    }
    TranslationActions.getTranslation({ inputText, noLoad: (this.context.settings.realTime == false) })
    this.clearCanvas()
  }

  handleClickOutside() {
    this.props.changeInputMode(null)
  }

  render() {
    return (
      <div className="app-write-control">
        <ReactWinJS.ListView
          className="app-list"
          itemDataSource={this.state.list.dataSource}
          itemTemplate={this.itemRenderer}
          onItemInvoked={this.handleItemInvoked.bind(this)} />
        <canvas
          ref="canvas"
          className="app-canvas"
          onMouseUp={this.handleMouseUp.bind(this)}
          onMouseDown={this.handleMouseDown.bind(this)}
          onMouseLeave={this.handleMouseLeave.bind(this)}
          onMouseMove={this.handleMouseMove.bind(this)}
          onTouchEnd={this.handleMouseUp.bind(this)}
          onTouchStart={this.handleMouseDown.bind(this)}
          onTouchMove={this.handleMouseMove.bind(this)}/>
        <div className="app-control-container">
          <button
            className="win-button"
            onClick={this.handleDeleteButtonClick.bind(this)}>
            {this.context.getString("delete")}
          </button>
          <button
            className="win-button"
            style={{ marginLeft: 6, width: "calc(100% - 252px)", minWidth: "auto" }}
            onClick={this.handleSpaceBarButtonClick.bind(this)}>
            {(this.context.mode == "small") ? "␣" : this.context.getString("space-bar")}
          </button>
          <button
            className="win-button"
            style={{ backgroundColor: this.context.settings.primaryColor.light, color: "#fff", marginLeft: 6 }}
            onClick={this.handleDoneButtonClick.bind(this)}>
            {this.context.getString("done")}
          </button>
        </div>
      </div>
    )
  }
}

WriteControl.contextTypes = {
  getString: React.PropTypes.func,
  settings: React.PropTypes.object,
  mode: React.PropTypes.string,
};

export default onClickOutside(WriteControl);
