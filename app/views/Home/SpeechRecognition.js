/* global Windows */

import React from 'react';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';

import i18n from '../../i18n';

import { switchIme } from '../../actions/home';
import { releaseDevice, startRecording, stopRecording } from '../../actions/speechRecognition';

class SpeechRecognition extends React.Component {
  componentWillMount() {
    const { onReleaseDevice } = this.props;

    Windows.UI.WebUI.WebUIApplication.addEventListener('suspending', onReleaseDevice);
  }

  componentWillUnmount() {
    const { onReleaseDevice } = this.props;

    onReleaseDevice();
    Windows.UI.WebUI.WebUIApplication.removeEventListener('suspending', onReleaseDevice);
  }

  handleClickOutside() {
    const { onTurnOffSpeechRecognition } = this.props;
    onTurnOffSpeechRecognition();
  }

  render() {
    const { speechRecognitionStatus, onControlButtonClick } = this.props;

    return (
      <div
        className={
          (speechRecognitionStatus === 'recording')
            ? 'app-speak-control active' : 'app-speak-control'
        }
      >
        {(speechRecognitionStatus === 'recognizing')
        ? (
          <progress className="win-progress-bar app-progress"></progress>
        ) :
          (<div>
            <div
              className="app-control-button"
              onClick={() => onControlButtonClick(speechRecognitionStatus)}
            >
              {speechRecognitionStatus === 'recording' ? '' : ''}
            </div>
            <div className="app-wave" />
            <div className="app-wave-2" />
            <div className="app-tips">
              <h4 className="win-h4">
                {
                  speechRecognitionStatus === 'recording'
                    ? i18n('tap-to-stop-recording')
                    : i18n('tap-to-start-recording')
                }
              </h4>
            </div>
          </div>)}
      </div>
    );
  }
}

SpeechRecognition.propTypes = {
  speechRecognitionStatus: React.PropTypes.string.isRequired,
  onControlButtonClick: React.PropTypes.func.isRequired,
  onTurnOffSpeechRecognition: React.PropTypes.func.isRequired,
  onReleaseDevice: React.PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  onControlButtonClick: (status) => {
    if (status !== 'recording') {
      dispatch(startRecording());
    } else {
      dispatch(stopRecording());
    }
  },
  onTurnOffSpeechRecognition: () => {
    dispatch(switchIme(null));
  },
  onReleaseDevice: () => {
    dispatch(releaseDevice());
  },
});

const mapStateToProps = (state) => ({
  speechRecognitionStatus: state.speechRecognition.status,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(onClickOutside(SpeechRecognition));
