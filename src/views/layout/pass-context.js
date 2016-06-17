import React from "react"

class PassContext extends React.Component {
  static propTypes = {
    context: React.PropTypes.object.isRequired,
    children: React.PropTypes.object.isRequired,
    style: React.PropTypes.object,
    className: React.PropTypes.string
  }

  static childContextTypes = {
    history: React.PropTypes.object,
    location: React.PropTypes.object,
    settings: React.PropTypes.object,
    getString: React.PropTypes.func,
    overwriteHandleBackClick: React.PropTypes.func,
    mode: React.PropTypes.string
  }

  getChildContext() {
    return this.props.context
  }

  render() {
    return <div className={this.props.className} style={this.props.style}>{this.props.children}</div>
  }
}

export default PassContext
