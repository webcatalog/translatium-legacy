/* global Windows */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import CircularProgress from 'material-ui/CircularProgress';
import AVMic from 'material-ui/svg-icons/av/mic';
import AVStop from 'material-ui/svg-icons/av/stop';

import { updateImeMode } from '../actions/home';
import { releaseDevice, startRecording, stopRecording } from '../actions/speech';

import getPlatform from '../libs/getPlatform';

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

  getStyles() {
    const { primary1Color, textColor } = this.context.muiTheme.palette;
    const { speechStatus } = this.props;

    return {
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
        border: `solid 1px ${textColor}`,
        animation: 'change-size 1.5s infinite',
        borderRadius: '50%',
        margin: 'auto',
        zIndex: -1,
        visibility: speechStatus === 'recording' ? 'visible' : 'hidden',
      },
      wave2: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        borderRadius: '50%',
        border: `solid 1px ${primary1Color}`,
        animation: 'change-size-2 1.5s infinite',
        margin: 'auto',
        height: 64,
        width: 64,
        zIndex: -1,
        visibility: speechStatus === 'recording' ? 'visible' : 'hidden',
      },
    };
  }

  render() {
    const { speechStatus, onControlButtonTouchTap } = this.props;
    const styles = this.getStyles();

    return (
      <Paper zDepth={2} style={styles.container}>
        {(speechStatus === 'recognizing')
        ? (
          <CircularProgress size={80} thickness={5} />
        ) :
          (
            <div>
              <FloatingActionButton
                onTouchTap={() => onControlButtonTouchTap(speechStatus)}
              >
                {speechStatus === 'recording' ? <AVStop /> : <AVMic />}
              </FloatingActionButton>
              <div style={styles.wave1} />
              <div style={styles.wave2} />
            </div>
          )}
      </Paper>
    );
  }
}

Speech.propTypes = {
  speechStatus: PropTypes.string.isRequired,
  onControlButtonTouchTap: PropTypes.func.isRequired,
  onReleaseDevice: PropTypes.func.isRequired,
};

Speech.contextTypes = {
  muiTheme: PropTypes.object,
};

const mapDispatchToProps = dispatch => ({
  onControlButtonTouchTap: (status) => {
    if (status !== 'recording') {
      dispatch(startRecording());
    } else {
      dispatch(stopRecording());
    }
  },
  onTurnOffSpeechRecognition: () => {
    dispatch(updateImeMode(null));
  },
  onReleaseDevice: () => {
    dispatch(releaseDevice());
  },
});

const mapStateToProps = state => ({
  speechStatus: state.speech.status,
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Speech);
