import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import AVMic from '@material-ui/icons/Mic';
import AVStop from '@material-ui/icons/Stop';

import connectComponent from '../../../helpers/connect-component';

import { updateImeMode } from '../../../state/pages/home/actions';
import { releaseDevice, startRecording, stopRecording } from '../../../state/pages/home/speech/actions';

import getPlatform from '../../../helpers/get-platform';

const styles = theme => ({
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
});

class Speech extends React.Component {
  componentWillUnmount() {
    const { onReleaseDevice } = this.props;

    onReleaseDevice();
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
          ? <CircularProgress size={80} />
          :
          (
            <div>
              <Button
                variant="fab"
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
  speechStatus: state.pages.home.speech.status,
});

export default connectComponent(
  Speech,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
