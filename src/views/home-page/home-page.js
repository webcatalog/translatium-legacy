import React from "react"
import ReactWinJS from "react-winjs"

import InputToolbar from "./input-toolbar.js"
import InputBox from "./input-box.js"
import OutputCard from "./output-card.js"
import SpeakControl from "./speak-control.js"
import WriteControl from "./write-control.js"

class HomePage extends React.Component {
  static contextTypes = {
    settings: React.PropTypes.object,
    overwriteHandleBackClick: React.PropTypes.func
  }

  static childContextTypes = {
    expanded: React.PropTypes.bool,
    toggleExpanded: React.PropTypes.func,
  }

  getChildContext() {
    return {
      expanded: this.state.expanded,
      toggleExpanded: this.toggleExpanded.bind(this)
    }
  }

  constructor() {
    super()

    this.state = {
      expanded: false,
      inputMode: null
    }
  }

  toggleExpanded() {
    let expanded = !this.state.expanded
    this.setState({ expanded })
    if (expanded) {
      this.context.overwriteHandleBackClick(this.toggleExpanded.bind(this))
    }
    else {
      this.context.overwriteHandleBackClick(null)
    }
  }

  changeInputMode(inputMode) {
    this.setState({ inputMode })
    if (inputMode) {
      this.context.overwriteHandleBackClick(this.changeInputMode.bind(this))
    }
    else {
      this.context.overwriteHandleBackClick(null)
    }
  }

  componentDidMount() {
    if (this.context.settings.preventingScreenLock == true) {
      this.dispRequest = new Windows.System.Display.DisplayRequest
      this.dispRequest.requestActive()
    }
  }

  componentWillUnmount() {
    if (this.dispRequest) {
      this.dispRequest.requestRelease()
    }
  }

  render() {
    return (
      <div className={`app-home-page ${(this.state.expanded) ? "app-expanded" : ""}`}>
        <InputToolbar changeInputMode={this.changeInputMode.bind(this)}/>
        <InputBox />
        <OutputCard />
        {(this.state.inputMode == "speak") ? <SpeakControl changeInputMode={this.changeInputMode.bind(this)} /> : null}
        {(this.state.inputMode == "write") ?<WriteControl changeInputMode={this.changeInputMode.bind(this)}/> : null}
      </div>
    )
  }
}
export default HomePage
