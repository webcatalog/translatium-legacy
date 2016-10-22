/* global fetch navigator */

import RecordRTC from 'recordrtc';

import { UPDATE_SPEECH_STATUS } from '../constants/actions';

import { updateInputText } from './home';

import insertAtCursor from '../libs/insertAtCursor';

let recorder;

export const releaseDevice = () => ((dispatch) => {
  if (!recorder) return;

  recorder.stopRecording(() => {
    dispatch({
      type: UPDATE_SPEECH_STATUS,
      status: 'none',
    });

    recorder.clearRecordedData();
    recorder = null;
  });
});

export const stopRecording = () => ((dispatch, getState) => {
  const { home, settings } = getState();
  const { inputText, selectionStart, selectionEnd } = home;
  const { inputLang } = settings;

  recorder.stopRecording(() => {
    dispatch({
      type: UPDATE_SPEECH_STATUS,
      status: 'recognizing',
    });

    const uri = `https://www.google.com/speech-api/v2/recognize?output=json&lang=${inputLang}`
              + '&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

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
    .then((recognizedText) => {
      dispatch({
        type: UPDATE_SPEECH_STATUS,
        status: 'none',
      });

      if (recognizedText.length < 1) return;

      const insertedText = insertAtCursor(
        inputText,
        recognizedText,
        selectionStart,
        selectionEnd
      );

      dispatch(updateInputText(
        insertedText.text,
        insertedText.selectionStart,
        insertedText.selectionEnd
      ));
    })
    .catch(() => {
      // console.log(err);
    })
    .then(() => {
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
      type: 'audio',
      audioType: 'audio/wav',
      sampleRate: 44100,
      numberOfAudioChannels: 1,
    });

    recorder.startRecording();
  }, () => {
    // error
  });
});
