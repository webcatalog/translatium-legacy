/* global strings */
import React from 'react';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Slider from 'material-ui/Slider';

import { updateSetting } from '../actions/settings';

class BiggerText extends React.Component {
  getStyles() {
    const { muiTheme } = this.context;

    return {
      container: {
        flex: 1,
        height: '100%',
        padding: '64px 16px 16px 16px',
        boxSizing: 'border-box',
        color: muiTheme.baseTheme.palette.textColor,
      },
      closeButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 100,
      },
      slider: {
        width: 'calc(100% - 32px)',
        position: 'absolute',
        bottom: -16,
        left: 16,
      },
    };
  }

  render() {
    const styles = this.getStyles();
    const { text, biggerTextFontSize, onSliderChange, onCloseTouchTap } = this.props;
    return (
      <div style={styles.container}>
        <FloatingActionButton
          mini
          style={styles.closeButton}
          onTouchTap={onCloseTouchTap}
        >
          <NavigationClose />
        </FloatingActionButton>
        <span style={{ fontSize: biggerTextFontSize, lineHeight: 'normal' }}>
          {text}
        </span>
        <Slider
          style={styles.slider}
          min={20}
          max={200}
          step={1}
          defaultValue={biggerTextFontSize}
          value={biggerTextFontSize}
          onChange={onSliderChange}
        />
      </div>
    );
  }
}

BiggerText.propTypes = {
  text: React.PropTypes.string,
  biggerTextFontSize: React.PropTypes.number,
  onCloseTouchTap: React.PropTypes.func,
  onSliderChange: React.PropTypes.func,
};

BiggerText.contextTypes = {
  muiTheme: React.PropTypes.object,
};


const mapStateToProps = (state, ownProps) => ({
  text: ownProps.location.query.text,
  biggerTextFontSize: state.settings.biggerTextFontSize,
});

const mapDispatchToProps = dispatch => ({
  onCloseTouchTap: () => {
    dispatch(goBack());
  },
  onSliderChange: (event, value) => {
    dispatch(updateSetting('biggerTextFontSize', value));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(BiggerText);
