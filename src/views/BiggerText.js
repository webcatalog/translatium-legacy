import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';

import Button from 'material-ui/Button';
import NavigationClose from 'material-ui-icons/Close';
// import Slider from 'material-ui/Slider';

import { updateSetting } from '../actions/settings';

class BiggerText extends React.Component {
  getStyles() {
    const { biggerTextFontSize } = this.props;

    return {
      container: {
        flex: 1,
        padding: '64px 16px 16px 16px',
        boxSizing: 'border-box',
        // color: muiTheme.baseTheme.palette.textColor,
        overflow: 'auto',
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
      textContainer: {
        fontSize: biggerTextFontSize,
        lineHeight: 'normal',
      },
    };
  }

  render() {
    const styles = this.getStyles();
    const { text, biggerTextFontSize, onSliderChange, onCloseClick } = this.props;
    return (
      <div style={styles.container}>
        <Button
          fab
          dense
          style={styles.closeButton}
          onClick={onCloseClick}
        >
          <NavigationClose />
        </Button>
        <span style={styles.textContainer}>
          {text}
        </span>
        <div
          key="NeedToChange"
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
  text: PropTypes.string,
  biggerTextFontSize: PropTypes.number,
  onCloseClick: PropTypes.func.isRequired,
  onSliderChange: PropTypes.func.isRequired,
};

BiggerText.contextTypes = {
  muiTheme: PropTypes.object,
};


const mapStateToProps = (state, ownProps) => ({
  text: ownProps.location.query.text,
  biggerTextFontSize: state.settings.biggerTextFontSize,
});

const mapDispatchToProps = dispatch => ({
  onCloseClick: () => dispatch(goBack()),
  onSliderChange: (event, value) => dispatch(updateSetting('biggerTextFontSize', value)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(BiggerText);
