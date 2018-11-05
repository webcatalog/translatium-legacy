/* global fetch navigator */

import RecordRTC from 'recordrtc';

import { UPDATE_SPEECH_STATUS } from '../../../../constants/actions';

import insertAtCursor from '../../../../helpers/insert-at-cursor';

import { updateInputText } from '../actions';
import { openAlert } from '../../../root/alert/actions';

const DURATION = 5 * 1000;

let recorder;

export const releaseDevice = () => ((dispatch) => {
  if (!recorder) return;

  dispatch({
    type: UPDATE_SPEECH_STATUS,
    status: 'none',
  });

  recorder.stopRecording(() => {
    recorder.clearRecordedData();
    recorder = null;
  });
});

export const stopRecording = () => ((dispatch, getState) => {
  const { settings, pages } = getState();
  const { home } = pages;
  const { inputText, selectionStart, selectionEnd } = home;
  const { inputLang, chinaMode } = settings;

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
});


export const startRecording = () => ((dispatch) => {
  dispatch({
    type: UPDATE_SPEECH_STATUS,
    status: 'recording',
  });

  navigator.getUserMedia({ audio: true, video: false }, (stream) => {
    recorder = new RecordRTC(stream, {
      recorderType: RecordRTC.StereoAudioRecorder,
      type: 'audio',
      audioType: 'audio/wav',
      mimeType: 'audio/wav',
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
});
