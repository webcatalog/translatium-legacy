/* global Tesseract */

import Immutable from 'immutable';

import {
  UPDATE_INPUT_TEXT, UPDATE_OUTPUT, UPDATE_IME_MODE,
} from '../constants/actions';

import translateText from '../libs/translateText';
import translateArray from '../libs/translateArray';
import phrasebookDb from '../libs/phrasebookDb';
import openFileToBlob from '../libs/openFileToBlob';
import captureToBlob from '../libs/captureToBlob';
import { toTesseractLanguage } from '../libs/languageUtils';

import { openAlert } from './alert';
import { updateSetting } from './settings';

export const translate = () => ((dispatch, getState) => {
  const { settings, home } = getState();
  const { inputLang, outputLang } = settings;
  const { inputText } = home;

  // Safe
  if (inputText.trim().length < 1) return;

  const identifier = Date.now();

  dispatch({
    type: UPDATE_OUTPUT,
    output: Immutable.fromJS({
      status: 'loading',
      identifier,
    }),
  });

  translateText(inputLang, outputLang, inputText)
    .then((result) => {
      // Prevent slow request to display outdated info
      const currentOutput = getState().home.output;
      if (currentOutput && currentOutput.get('identifier') === identifier) {
        const r = result;
        r.status = 'done';
        r.inputLang = inputLang;
        r.outputLang = outputLang;
        r.inputText = inputText;
        dispatch({
          type: UPDATE_OUTPUT,
          output: Immutable.fromJS(r),
        });
      }
    })
    .catch(() => {
      // Prevent slow request to display outdated info
      const currentOutput = getState().home.output;
      if (currentOutput && currentOutput.get('identifier') === identifier) {
        dispatch(openAlert('cannotConnectToServer'));

        dispatch({
          type: UPDATE_OUTPUT,
          output: null,
        });
      }
    });
});

export const updateInputText = (inputText, selectionStart, selectionEnd) =>
  ((dispatch, getState) => {
    const { settings, home } = getState();
    const realtime = settings.realtime;
    const currentInputText = home.inputText;

    dispatch({ type: UPDATE_INPUT_TEXT, inputText, selectionStart, selectionEnd });

    // No change in inputText, no need to re-run task
    if (currentInputText === inputText) return;

    if (realtime === true && inputText.trim().length > 0) {
      // delay to save bandwidth
      const tmpHome = getState().home;
      setTimeout(() => {
        if (getState().home.inputText !== inputText) return;
        dispatch(translate());
      }, tmpHome.output ? 300 : 0);
    } else {
      dispatch({
        type: UPDATE_OUTPUT,
        output: null,
      });
    }
  });

export const togglePhrasebook = () => ((dispatch, getState) => {
  const { output } = getState().home;

  const phrasebookId = output.get('phrasebookId');

  if (phrasebookId) {
    phrasebookDb.get(phrasebookId)
      .then(doc => phrasebookDb.remove(doc))
      .then(() => {
        dispatch({
          type: UPDATE_OUTPUT,
          output: output.delete('phrasebookId'),
        });
      });
  } else {
    const newPhrasebookId = new Date().toJSON();
    phrasebookDb.put({
      _id: newPhrasebookId,
      data: output.toJS(),
      phrasebookVersion: 3,
    })
    .then(() => {
      dispatch({
        type: UPDATE_OUTPUT,
        output: output.set('phrasebookId', newPhrasebookId),
      });
    });
  }
});

export const loadOutput = output => ((dispatch) => {
  // First load output
  dispatch({
    type: UPDATE_OUTPUT,
    output,
  });

  // Update inputLang, outputLang, inputText without running anything;
  dispatch(updateSetting('inputLang', output.get('inputLang')));
  dispatch(updateSetting('outputLang', output.get('outputLang')));
  dispatch({
    type: UPDATE_INPUT_TEXT,
    inputText: output.get('inputText'),
    selectionStart: 0,
    selectionEnd: 0,
  });
});

export const updateImeMode = imeMode => ({
  type: UPDATE_IME_MODE,
  imeMode,
});

export const loadImage = fromCamera => (dispatch, getState) => {
  const { inputLang, outputLang } = getState().settings;

  Promise.resolve()
    .then(() => {
      if (fromCamera === true) return captureToBlob();
      return openFileToBlob();
    })
    .then((blob) => {
      if (!blob) return;

      const identifier = Date.now();

      dispatch({
        type: UPDATE_OUTPUT,
        output: Immutable.fromJS({
          status: 'loading',
          identifier,
        }),
      });
      // Tesseract seems to use non-standard Promise, so no return;
      Tesseract.recognize(blob, {
        lang: toTesseractLanguage(inputLang),
      })
      .then((result) => {
        const inputLines = result.lines.map(line => ({
          text: line.text.replace(/(\r\n|\n|\r)/gm, ''),
          bbox: line.bbox,
        }));

        const inputArray = inputLines.map(line => line.text);

        translateArray(inputLang, outputLang, inputArray)
          .then((outputArr) => {
            const currentOutput = getState().home.output;
            if (currentOutput && currentOutput.get('identifier') === identifier) {
              const outputLines = outputArr.map((text, i) => ({
                text,
                bbox: inputLines[i].bbox,
              }));

              let outputText = '';
              outputArr.forEach((text) => { outputText += `${text}\r\n`; });

              dispatch({
                type: UPDATE_INPUT_TEXT,
                inputText: result.text,
                selectionStart: 0,
                selectionEnd: 0,
              });

              dispatch({
                type: UPDATE_OUTPUT,
                output: Immutable.fromJS({
                  status: 'done',
                  image: {
                    blob, inputLines, outputLines,
                  },
                  inputLang,
                  outputLang,
                  inputText: result.text,
                  outputText,
                }),
              });
            }
          })
          .catch(() => {
            // Prevent slow request to display outdated info
            const currentOutput = getState().home.output;
            if (currentOutput && currentOutput.get('identifier') === identifier) {
              dispatch(openAlert('cannotConnectToServer'));

              dispatch({
                type: UPDATE_OUTPUT,
                output: null,
              });
            }
          });
      })
      .catch(() => {
        // Prevent slow request to display outdated info
        const currentOutput = getState().home.output;
        if (currentOutput && currentOutput.get('identifier') === identifier) {
          dispatch(openAlert('cannotConnectToServer'));
        }
      });
    })
    .catch(() => {
      dispatch({
        type: UPDATE_OUTPUT,
        output: null,
      });

      dispatch(openAlert('cannotOpenTheFile'));
    });
};
