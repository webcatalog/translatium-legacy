/* global fetch navigator Windows */

import RecordRTC from 'recordrtc';

import { UPDATE_SPEECH_STATUS } from '../constants/actions';

import { updateInputText } from './home';

import getPlatform from '../libs/getPlatform';
import insertAtCursor from '../libs/insertAtCursor';
import winXhr from '../libs/winXhr';

import { openAlert } from './alert';

const DURATION = 5 * 1000;

// global for electron/common
let recorder;

// global for windows
let mediaCaptureMgr;
let soundStream;
let checkTime;


export const releaseDevice = () => ((dispatch, getState) => {
  switch (getPlatform()) {
    case 'windows': {
      const { status } = getState().speech;
      if (status === 'recording' || mediaCaptureMgr) {
        clearInterval(checkTime);
        dispatch({
          type: UPDATE_SPEECH_STATUS,
          status: 'none',
        });
        if (mediaCaptureMgr) {
          mediaCaptureMgr.close();
          mediaCaptureMgr = null;
        }
        const systemMediaControls = Windows.Media.SystemMediaTransportControls.getForCurrentView();
        systemMediaControls.onpropertychanged = null;
      }
      break;
    }
    case 'mac': {
      if (!recorder) return;

      recorder.stopRecording(() => {
        dispatch({
          type: UPDATE_SPEECH_STATUS,
          status: 'none',
        });

        recorder.clearRecordedData();
        recorder = null;
      });

      break;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support');
      /* eslint-enable no-console */
    }
  }
});

export const stopRecording = () => ((dispatch, getState) => {
  const { home, settings, speech } = getState();
  const { inputText, selectionStart, selectionEnd } = home;
  const { inputLang, chinaMode } = settings;
  const { status } = speech;

  const endpoint = process.env.REACT_APP_GOOGLE_ENDPOINT || (chinaMode === true ? 'http://www.google.cn' : 'https://www.google.com');

  const uri = `${endpoint}/speech-api/v2/recognize?output=json&lang=${inputLang}`
            + '&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

  const insertText = (recognizedText) => {
    dispatch({
      type: UPDATE_SPEECH_STATUS,
      status: 'none',
    });

    if (recognizedText.length < 1) return;

    const insertedText = insertAtCursor(
      inputText,
      recognizedText,
      selectionStart,
      selectionEnd,
    );

    dispatch(updateInputText(
      insertedText.text,
      insertedText.selectionStart,
      insertedText.selectionEnd,
    ));
  };

  switch (getPlatform()) {
    case 'windows': {
      clearInterval(checkTime);
      if (status === 'recording') {
        dispatch({
          type: UPDATE_SPEECH_STATUS,
          status: 'recognizing',
        });
        mediaCaptureMgr.stopRecordAsync()
          .then(() => {
            mediaCaptureMgr.close();
            mediaCaptureMgr = null;
            const systemMediaControls =
              Windows.Media.SystemMediaTransportControls.getForCurrentView();
            systemMediaControls.onpropertychanged = null;
            return soundStream.flushAsync();
          })
          .then(() => {
            Promise.resolve()
              .then(() => {
                const data =
                  new Windows.Web.Http.HttpStreamContent(soundStream.getInputStreamAt(0));
                data.headers.contentType =
                  new Windows.Web.Http.Headers.HttpMediaTypeHeaderValue('audio/l16; rate=16000');

                return winXhr({
                  type: 'post',
                  uri,
                  responseType: 'text',
                  data,
                });
              })
              .then((text) => {
                if (text.length > 14) {
                  const xmlStr = text.substring(14, text.length);
                  const outputText = JSON.parse(xmlStr).result[0].alternative[0].transcript;
                  return outputText;
                }
                return '';
              })
              .then(insertText)
              .then(() => {
                soundStream = null;
              })
              .catch(() => {
                dispatch(openAlert('cannotConnectToServer'));
              })
              .then(() => {
                dispatch({
                  type: UPDATE_SPEECH_STATUS,
                  status: 'none',
                });
              });
          });
      }
      break;
    }
    case 'mac': {
      recorder.stopRecording(() => {
        dispatch({
          type: UPDATE_SPEECH_STATUS,
          status: 'recognizing',
        });

        return fetch(uri, {
          method: 'POST',
          headers: {
            'Content-Type': 'audio/l16; rate=44100',
          },
          body: recorder.getBlob(),
        })
        .then(response => response.text())
        .then((text) => {
          if (text.length > 14) {
            const xmlStr = text.substring(14, text.length);
            const outputText = JSON.parse(xmlStr).result[0].alternative[0].transcript;
            return outputText;
          }
          return '';
        })
        .then(insertText)
        .catch(() => {
          dispatch(openAlert('cannotConnectToServer'));
        })
        .then(() => {
          dispatch({
            type: UPDATE_SPEECH_STATUS,
            status: 'none',
          });
          // clean
          recorder.clearRecordedData();
          recorder = null;
        });
      });
      break;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support');
      /* eslint-enable no-console */
    }
  }
});


export const startRecording = () => ((dispatch) => {
  dispatch({
    type: UPDATE_SPEECH_STATUS,
    status: 'recording',
  });

  switch (getPlatform()) {
    case 'windows': {
      if (!mediaCaptureMgr) {
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
                                    Windows.Media.MediaProperties.AudioEncodingQuality.auto,
                                  );
          encodingProfile.audio.sampleRate = 16000;
          encodingProfile.audio.channelCount = 1;
          soundStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
          return mediaCaptureMgr.startRecordToStreamAsync(encodingProfile, soundStream);
        })
        .then(null, () => {});
      break;
    }
    case 'mac': {
      navigator.getUserMedia({ audio: true, video: false }, (stream) => {
        recorder = new RecordRTC(stream, {
          type: 'audio',
          audioType: 'audio/wav',
          sampleRate: 44100,
          numberOfAudioChannels: 1,
        });

        recorder.setRecordingDuration(DURATION).onRecordingStopped(() => {
          dispatch(stopRecording());
        });

        recorder.startRecording();
      }, () => {
        dispatch(openAlert('cannotActivateMicrophone'));
      });
      break;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support');
      /* eslint-enable no-console */
    }
  }
});
