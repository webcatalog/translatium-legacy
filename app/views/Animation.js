/* global WinJS */

import React from 'react';
import { findDOMNode } from 'react-dom';

class Animation extends React.Component {
  componentDidMount() {
    WinJS.UI.Animation[this.props.name](findDOMNode(this)).done();
  }

  render() {
    const { children } = this.props;

    return <div style={{ height: '100%' }}>{children}</div>;
  }
}

Animation.propTypes = {
  name: React.PropTypes.string.isRequired,
  children: React.PropTypes.node.isRequired,
};

export default Animation;
