/* global Windows */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { withStyles, createStyleSheet } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import AVMic from 'material-ui-icons/Mic';
import AVStop from 'material-ui-icons/Stop';

import { updateImeMode } from '../actions/home';
import { releaseDevice, startRecording, stopRecording } from '../actions/speech';

import getPlatform from '../libs/getPlatform';

const styleSheet = createStyleSheet('Speech', theme => ({
  container: {
    position: 'absolute',
    width: '100vw',
    height: 240,
    zIndex: 1499,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave1: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    border: `solid 1px ${theme.palette.text.primary}`,
    animation: 'change-size 1.5s infinite',
    borderRadius: '50%',
    margin: 'auto',
    zIndex: -1,
    visibility: 'hidden',
  },
  wave1Recording: {
    visibility: 'visible',
  },
  wave2: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: '50%',
    border: `solid 1px ${theme.palette.primary[500]}`,
    animation: 'change-size-2 1.5s infinite',
    margin: 'auto',
    height: 64,
    width: 64,
    zIndex: -1,
    visibility: 'hidden',
  },
  wave2Recording: {
    visibility: 'visible',
  },
}));

class Speech extends React.Component {
  componentWillMount() {
    if (getPlatform() === 'windows') {
      const { onReleaseDevice } = this.props;
      Windows.UI.WebUI.WebUIApplication.addEventListener('suspending', onReleaseDevice);
    }
  }

  componentWillUnmount() {
    const { onReleaseDevice } = this.props;

    onReleaseDevice();

    if (getPlatform() === 'windows') {
      Windows.UI.WebUI.WebUIApplication.removeEventListener('suspending', onReleaseDevice);
    }
  }

  render() {
    const {
      classes,
      speechStatus,
      onControlButtonClick,
    } = this.props;

    return (
      <Paper elevation={2} className={classes.container}>
        {(speechStatus === 'recognizing')
        ? (
          <CircularProgress size={80} />
        ) :
          (
            <div>
              <Button
                fab
                color="primary"
                onClick={() => onControlButtonClick(speechStatus)}
              >
                {speechStatus === 'recording' ? <AVStop /> : <AVMic />}
              </Button>
              <div className={classNames(classes.wave1, { [classes.wave1Recording]: speechStatus === 'recording' })} />
              <div className={classNames(classes.wave2, { [classes.wave2Recording]: speechStatus === 'recording' })} />
            </div>
          )}
      </Paper>
    );
  }
}

Speech.propTypes = {
  classes: PropTypes.object.isRequired,
  speechStatus: PropTypes.string.isRequired,
  onControlButtonClick: PropTypes.func.isRequired,
  onReleaseDevice: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onControlButtonClick: (status) => {
    if (status !== 'recording') {
      dispatch(startRecording());
    } else {
      dispatch(stopRecording());
    }
  },
  onTurnOffSpeechRecognition: () => dispatch(updateImeMode(null)),
  onReleaseDevice: () => dispatch(releaseDevice()),
});

const mapStateToProps = state => ({
  speechStatus: state.speech.status,
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(withStyles(styleSheet)(Speech));
