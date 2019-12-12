import {
  TOGGLE_FULLSCREEN_INPUT_BOX,
  UPDATE_INPUT_TEXT,
  UPDATE_OUTPUT,
} from '../../../constants/actions';

import translateText from '../../../helpers/translate-text';
import phrasebookDb from '../../../helpers/phrasebook-db';

import { openAlert } from '../../root/alert/actions';
import { addHistoryItem } from './history/actions';

import { requestSetPreference } from '../../../senders';

export const toggleFullscreenInputBox = () => ({
  type: TOGGLE_FULLSCREEN_INPUT_BOX,
});

export const translate = (saveToHistory) => ((dispatch, getState) => {
  const { preferences, pages: { home } } = getState();
  const { inputLang, outputLang, preferredTranslationService } = preferences;
  const { inputText, fullscreenInputBox } = home;

  // Safe
  if (inputText.trim().length < 1) return;

  const identifier = Date.now();

  if (fullscreenInputBox === true) {
    dispatch(toggleFullscreenInputBox());
  }

  dispatch({
    type: UPDATE_OUTPUT,
    output: {
      status: 'loading',
      identifier,
    },
  });

  translateText(inputLang, outputLang, inputText, preferredTranslationService)
    .then((result) => {
      // Prevent slow request to display outdated info
      const currentOutput = getState().pages.home.output;
      if (currentOutput && currentOutput.identifier === identifier) {
        const r = result;
        r.status = 'done';
        r.inputLang = result.inputLang || inputLang;
        r.outputLang = result.outputLang || outputLang;

        if (saveToHistory === true) {
          dispatch(addHistoryItem(r));
        }

        dispatch({
          type: UPDATE_OUTPUT,
          output: r,
        });
      }
    })
    .catch((err) => {
      console.log(err); // eslint-disable-line no-console
      // Prevent slow request to display outdated info
      const currentOutput = getState().pages.home.output;
      if (currentOutput && currentOutput.identifier === identifier) {
        dispatch(openAlert('cannotConnectToServer'));

        dispatch({
          type: UPDATE_OUTPUT,
          output: null,
        });
      }
    });
});

let timeout;
export const updateInputText = (
  inputText, selectionStart, selectionEnd,
) => ((dispatch, getState) => {
  const { preferences, pages } = getState();
  const { home } = pages;
  const { realtime } = preferences;
  const currentInputText = home.inputText;
  const { fullscreenInputBox } = home;

  dispatch({
    type: UPDATE_INPUT_TEXT,
    inputText,
    selectionStart,
    selectionEnd,
  });

  // No change in inputText, no need to re-run task
  if (currentInputText === inputText) return;

  clearTimeout(timeout);
  if (realtime === true && fullscreenInputBox === false && inputText.trim().length > 0) {
    dispatch({
      type: UPDATE_OUTPUT,
      output: null,
    });

    // delay to save bandwidth
    const tmpHome = getState().pages.home;
    timeout = setTimeout(() => {
      if (getState().pages.home.inputText !== inputText) return;
      dispatch(translate());
    }, tmpHome.output ? 500 : 0);
  } else {
    dispatch({
      type: UPDATE_OUTPUT,
      output: null,
    });
  }
});

export const insertInputText = (text) => (dispatch, getState) => {
  const { pages: { home } } = getState();
  const { inputText, selectionStart } = home;

  const newText = inputText.length < 1 ? text : `${inputText} ${text}`;

  dispatch(updateInputText(newText, selectionStart, newText.length));
};

export const togglePhrasebook = () => ((dispatch, getState) => {
  const { output } = getState().pages.home;

  const { phrasebookId } = output;

  if (phrasebookId) {
    phrasebookDb.get(phrasebookId)
      .then((doc) => phrasebookDb.remove(doc))
      .then(() => {
        const newOutput = { ...output, phrasebookId: null };

        dispatch({
          type: UPDATE_OUTPUT,
          output: newOutput,
        });
      });
  } else {
    const newPhrasebookId = new Date().toJSON();
    phrasebookDb.put({
      _id: newPhrasebookId,
      data: output,
      phrasebookVersion: 3,
    })
      .then(() => {
        dispatch({
          type: UPDATE_OUTPUT,
          output: { ...output, phrasebookId: newPhrasebookId },
        });
      });
  }
});

export const loadOutput = (output) => ((dispatch) => {
  // First load output
  dispatch({
    type: UPDATE_OUTPUT,
    output,
  });

  // Update inputLang, outputLang, inputText without running anything;
  requestSetPreference('inputLang', output.inputLang);
  requestSetPreference('outputLang', output.outputLang);
  dispatch({
    type: UPDATE_INPUT_TEXT,
    inputText: output.inputText,
    selectionStart: 0,
    selectionEnd: 0,
  });
});
