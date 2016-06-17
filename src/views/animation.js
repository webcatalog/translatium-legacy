import React from "react"
import ReactDOM from "react-dom"

export default class Animation extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  }

  componentDidMount() {
    WinJS.UI.Animation[this.props.name](ReactDOM.findDOMNode(this)).done()
  }

  render() {
    return (
      <div {...this.props}>
        {this.props.children}
      </div>
    )
  }
}
