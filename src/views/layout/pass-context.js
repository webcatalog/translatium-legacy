import React from 'react';

class PassContext extends React.Component {
  getChildContext() {
    return this.props.context;
  }

  render() {
    return (
      <div
        className={this.props.className}
        style={this.props.style}
      >
        {this.props.children}
      </div>
    );
  }
}

PassContext.propTypes = {
  context: React.PropTypes.object.isRequired,
  children: React.PropTypes.object.isRequired,
  style: React.PropTypes.object,
  className: React.PropTypes.string,
};

PassContext.childContextTypes = {
  history: React.PropTypes.object,
  location: React.PropTypes.object,
  settings: React.PropTypes.object,
  getString: React.PropTypes.func,
  overwriteHandleBackClick: React.PropTypes.func,
  mode: React.PropTypes.string,
};

export default PassContext;
