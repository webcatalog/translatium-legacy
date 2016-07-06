/* global Windows MSApp */

import { UPDATE_SPEECH_RECOGNITION_STATUS } from '../constants/actions';

let mediaCaptureMgr = null;
let soundStream = null;
let checkTime = null;

import { updateInputText } from './home';
import recognizeSpeech from '../lib/recognizeSpeech';
import i18n from '../i18n';

export const releaseDevice = () => ((dispatch, getState) => {
  const { status } = getState().speechRecognition;

  if (status === 'recording' || mediaCaptureMgr != null) {
    clearInterval(checkTime);

    dispatch({
      type: UPDATE_SPEECH_RECOGNITION_STATUS,
      status: 'none',
    });

    if (mediaCaptureMgr) {
      mediaCaptureMgr.close();
      mediaCaptureMgr = null;
    }

    const systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView();
    systemMediaControls.onpropertychanged = null;
  }
});

export const stopRecording = () => ((dispatch, getState) => {
  const { settings, home, speechRecognition } = getState();
  const { status } = speechRecognition;
  const { inputLang } = settings;
  const { inputText } = home;

  clearInterval(checkTime);
  if (status === 'recording') {
    dispatch({
      type: UPDATE_SPEECH_RECOGNITION_STATUS,
      status: 'recognizing',
    });
    mediaCaptureMgr.stopRecordAsync()
      .then(() => {
        mediaCaptureMgr.close();
        mediaCaptureMgr = null;
        const systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView();
        systemMediaControls.onpropertychanged = null;
        return soundStream.flushAsync();
      })
      .then(() => {
        recognizeSpeech(inputLang, soundStream)
          .then(({ outputText }) => {
            soundStream = null;
            dispatch(updateInputText(`${inputText} ${outputText}`));
            dispatch({
              type: UPDATE_SPEECH_RECOGNITION_STATUS,
              status: 'none',
            });
          })
          .catch(() => {
            dispatch({
              type: UPDATE_SPEECH_RECOGNITION_STATUS,
              status: 'none',
            });

            const title = i18n('connect-problem');
            const content = i18n('check-connect');
            const msg = new Windows.UI.Popups.MessageDialog(content, title);
            msg.showAsync().done();
          });
      });
  }
});


export const startRecording = () => ((dispatch) => {
  if (mediaCaptureMgr === null) {
    mediaCaptureMgr = new Windows.Media.Capture.MediaCapture();
    const systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView();
    systemMediaControls.onpropertychanged = (e) => {
      if (e.property === Windows.Media.SystemMediaTransportControlsProperty.soundLevel) {
        if (e.target.soundLevel === Windows.Media.SoundLevel.muted) {
          dispatch(releaseDevice());
        }
      }
    };
  }

  dispatch({
    type: UPDATE_SPEECH_RECOGNITION_STATUS,
    status: 'recording',
  });

  const captureInitSettings = new Windows.Media.Capture.MediaCaptureInitializationSettings();
  captureInitSettings.audioDeviceId = '';
  captureInitSettings.videoDeviceId = '';
  captureInitSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audio;

  mediaCaptureMgr.initializeAsync(captureInitSettings)
    .then(() => {
      checkTime = setInterval(() => {
        dispatch(stopRecording());
      }, 10000);
      const encodingProfile = Windows.Media.MediaProperties.MediaEncodingProfile.createWav(
                                Windows.Media.MediaProperties.AudioEncodingQuality.auto
                              );
      encodingProfile.audio.sampleRate = 16000;
      encodingProfile.audio.channelCount = 1;
      soundStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
      return mediaCaptureMgr.startRecordToStreamAsync(encodingProfile, soundStream);
    })
    .then(null, () => {});
});
