import PouchDB from 'pouchdb';

import {
  TOGGLE_EXPANDED,
  UPDATE_INPUT_TEXT, UPDATE_HOME_MULTIPLE,
} from '../constants/actions';

import translateText from '../lib/translateText';

const phrasebookDb = new PouchDB('favorites');

export const toggleExpanded = () => ({ type: TOGGLE_EXPANDED });

export const clearHome = () => ({
  type: UPDATE_HOME_MULTIPLE,
  newValue: {
    status: 'none',
    outputText: null,
    inputRoman: null,
    outputRoman: null,
    outputSegments: null,
    detectedInputLang: null,
    inputDict: null,
    outputDict: null,
    suggestedInputLang: null,
    suggestedInputText: null,
    phrasebookId: null,
  },
});

export const translate = () => ((dispatch, getState) => {
  const { settings, home } = getState();
  const { inputLang, outputLang, chinaMode } = settings;
  const { inputText, inputExpanded } = home;

  if (inputText.length < 1) return;

  if (inputExpanded === true) dispatch(toggleExpanded());

  dispatch({
    type: UPDATE_HOME_MULTIPLE,
    newValue: {
      status: 'loading',
      outputText: null,
      inputRoman: null,
      outputRoman: null,
      outputSegments: null,
      detectedInputLang: null,
      inputDict: null,
      outputDict: null,
      suggestedInputLang: null,
      suggestedInputText: null,
      phrasebookId: null,
    },
  });

  translateText(inputLang, outputLang, inputText, { chinaMode })
    .then(({
      outputText, inputRoman, outputRoman, outputSegments,
      detectedInputLang, inputDict, outputDict,
      suggestedInputLang, suggestedInputText,
    }) => {
      if (inputText !== getState().home.inputText) return;
      dispatch({
        type: UPDATE_HOME_MULTIPLE,
        newValue: {
          status: 'successful',
          outputText, inputRoman, outputRoman, outputSegments,
          detectedInputLang, inputDict, outputDict,
          suggestedInputLang, suggestedInputText,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: UPDATE_HOME_MULTIPLE,
        newValue: {
          status: 'failed',
        },
      });
    });
});

export const updateInputText = (inputText) => ((dispatch, getState) => {
  const { settings, home } = getState();
  const { realtime } = settings;
  const { inputExpanded } = home;

  dispatch({ type: UPDATE_INPUT_TEXT, inputText });

  if (inputText.length === 0) dispatch(clearHome());

  if (realtime === true && inputExpanded === false) dispatch(translate());
});

export const translateWithInfo = (inputLang, outputLang, inputText) =>
  ((dispatch) => {
    dispatch({
      type: UPDATE_HOME_MULTIPLE,
      newValue: { inputLang, outputLang, inputText },
    });

    dispatch(translate());
  });

export const togglePhrasebook = () => ((dispatch, getState) => {
  const { settings, home } = getState();
  const { inputLang, outputLang } = settings;
  const { inputText, outputText, inputDict, outputDict, phrasebookId } = home;

  if (phrasebookId) {
    phrasebookDb.get(phrasebookId)
      .then(doc => phrasebookDb.remove(doc))
      .then(() => {
        dispatch({
          type: UPDATE_HOME_MULTIPLE,
          newValue: { phrasebookId: null },
        });
      });
  } else {
    const newPhrasebookId = new Date().toJSON();
    phrasebookDb.put({
      _id: newPhrasebookId,
      inputLang, outputLang,
      inputText, outputText,
      inputDict, outputDict,
    })
    .then(() => {
      dispatch({
        type: UPDATE_HOME_MULTIPLE,
        newValue: { phrasebookId: newPhrasebookId },
      });
    });
  }
});
