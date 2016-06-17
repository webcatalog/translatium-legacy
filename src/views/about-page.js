import React from "react"
import ReactWinJS from "react-winjs"
import Animation from "views/animation.js"

class AboutPage extends React.Component {
  static contextTypes = {
    getString: React.PropTypes.func,
    settings: React.PropTypes.object
  }

  openURI(uriStr) {
    let uri = new Windows.Foundation.Uri(uriStr)
    return Windows.System.Launcher.launchUriAsync(uri)
  }

  renderInfo() {
    return (
      <div>
        <div className="app-logo-container">
          <img src="/images/Square150x150.png" className="app-logo" />
        </div>
        <div className="app-info">
          <h4 className="win-h4" style={{ marginTop: 18 }}>{this.context.getString("app-name")}</h4>
          <h5 className="win-h5">4.6.1</h5>
          <button
            className="win-button"
            onClick={this.openURI.bind(this, "https://moderntranslator.com")}>
            {this.context.getString("website")}
          </button>
          <button
            className="win-button"
            onClick={this.openURI.bind(this, "ms-windows-store://pdp/?ProductId=9wzdncrcsg9k")}>
            {this.context.getString("view-on-store")}
          </button>
          <button
            className="win-button"
            onClick={this.openURI.bind(this, "https://moderntranslator.com/changelog/windows")}>
            {this.context.getString("changelog")}
          </button>
          <h5 className="win-h5">
            A product of <a href="https://quanglam.me">Quang Lam</a>.
            Made with <span style={{ color: "#F44336" }}>&hearts;</span> in <strong>Vietnam</strong>.
          </h5>
        </div>
        <div className="app-feedback">
          <h5 className="win-h5">
            {this.context.getString("feedback-desc-1")}
          </h5>
          <h6 className="win-h6" style={{ marginBottom: 6 }}>
            {this.context.getString("feedback-desc-2")}
          </h6>
          <button
            className="win-button"
            onClick={this.openURI.bind(this, "https://moderntranslator.com/support")}>
            FAQ
          </button>
          <button
            className="win-button"
            onClick={this.openURI.bind(this, "mailto:support@moderntranslator.com")}>
            {this.context.getString("email-us")}
          </button>
          <button
            className="win-button"
            style={{ backgroundColor: "#55acee", color: "#fff" }}
            onClick={this.openURI.bind(this, "https://twitter.com/mdrtranslator")}>
            {this.context.getString("follow-us")}
          </button>
        </div>
        <div className="app-feedback" style={{ marginBottom: 12 }}>
          <h5 className="win-h5">
            {this.context.getString("love-our-app")}
          </h5>
          <button
            className="win-button"
            style={{ backgroundColor: this.context.settings.primaryColor.light, color: "#fff", marginTop: 6 }}
            onClick={this.openURI.bind(this, "ms-windows-store://review/?ProductId=9wzdncrcsg9k")}>
            {this.context.getString("give-us-5-star")}
          </button>
        </div>
      </div>
    )
  }

  render() {
    return (
      <Animation name="enterPage" className="app-about-page">
        {this.renderInfo()}
      </Animation>
    )
  }
}

export default AboutPage
