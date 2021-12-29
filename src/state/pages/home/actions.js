/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import {
  TOGGLE_FULLSCREEN_INPUT_BOX,
  UPDATE_INPUT_TEXT,
  UPDATE_OUTPUT,
} from '../../../constants/actions';

import amplitude from '../../../amplitude';

import translateText from '../../../helpers/translate-text';
import phrasebookDb from '../../../helpers/phrasebook-db';
import { isInputLanguage, isOutputLanguage } from '../../../helpers/language-utils';

import { openAlert } from '../../root/alert/actions';
import { addHistoryItem } from './history/actions';
import { swapLanguages } from '../../root/preferences/actions';

import { requestSetPreference } from '../../../senders';

export const toggleFullscreenInputBox = () => ({
  type: TOGGLE_FULLSCREEN_INPUT_BOX,
});

export const translate = (
  _inputLang, _outputLang, _inputText,
) => ((dispatch, getState) => {
  const { preferences, pages: { home } } = getState();
  const { fullscreenInputBox } = home;

  const inputLang = _inputLang || preferences.inputLang;
  const outputLang = _outputLang || preferences.outputLang;
  const inputText = _inputText || home.inputText;

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

  translateText(inputLang, outputLang, inputText)
    .then((result) => {
      // automatically swap language
      // for example if user tries to translate from Japanese to English
      // but the input text is in English
      // then we assume the user actually wants to translate from English to Japanese.
      if (result.detectedInputLang !== inputLang && result.detectedInputLang === outputLang) {
        dispatch(swapLanguages());
        dispatch(translate(outputLang, inputLang, inputText));
        return;
      }

      // only log when the action is successful
      amplitude.getInstance().logEvent('translate text');

      // Prevent slow request to display outdated info
      const currentOutput = getState().pages.home.output;
      if (currentOutput && currentOutput.identifier === identifier) {
        const r = result;
        r.status = 'done';
        r.inputLang = result.inputLang || inputLang;
        r.outputLang = result.outputLang || outputLang;

        dispatch(addHistoryItem(r));

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

export const updateInputText = (
  inputText,
) => ((dispatch, getState) => {
  const { pages } = getState();
  const { home } = pages;
  const currentInputText = home.inputText;

  dispatch({
    type: UPDATE_INPUT_TEXT,
    inputText,
  });

  // No change in inputText, no need to re-run task
  if (currentInputText === inputText) return;

  dispatch({
    type: UPDATE_OUTPUT,
    output: null,
  });
});

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
  // certain languages in history & phrasebook are deprecated so check first
  if (isInputLanguage(output.inputLang)) {
    requestSetPreference('inputLang', output.inputLang);
  }
  if (isOutputLanguage(output.outputLang)) {
    requestSetPreference('outputLang', output.outputLang);
  }

  dispatch({
    type: UPDATE_INPUT_TEXT,
    inputText: output.inputText,
  });
});
