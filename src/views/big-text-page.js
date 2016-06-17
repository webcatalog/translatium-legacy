import React from "react"
import ReactWinJS from "react-winjs"
import connectToStores from "alt-utils/lib/connectToStores"
import TranslationStore from "stores/translation.js"
import SettingActions from "actions/setting.js"
import Animation from "views/animation.js"

class BigTextPage extends React.Component {
  static contextTypes = {
    getString: React.PropTypes.func,
    settings: React.PropTypes.object
  }

  static getStores() {
    return [TranslationStore]
  }

  static getPropsFromStores() {
    return TranslationStore.getState()
  }

  handleSliderChange(evt) {
    SettingActions.setValue({ name: "bigTextFontSize", value: this.refs.slider.value })
  }

  render() {
    return (
      <Animation name="enterPage" className="app-big-text-page">
        <div className="app-content" style={{ fontSize: this.context.settings.bigTextFontSize }}>
          {this.props.outputObj.outputText}
        </div>
        <div className="app-toolbar">
          <input
            ref="slider"
            type="range"
            min={20}
            max={200}
            value={this.context.settings.bigTextFontSize}
            onChange={this.handleSliderChange.bind(this)}
            className="win-slider" />
        </div>
      </Animation>
    )
  }
}
export default connectToStores(BigTextPage)
