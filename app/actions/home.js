import {
  TOGGLE_EXPANDED,
  UPDATE_INPUT_TEXT, UPDATE_HOME_MULTIPLE,
} from '../constants/actions';

import translateText from '../lib/translateText';

export const toggleExpanded = () => ({ type: TOGGLE_EXPANDED });

export const clearHome = () => ({
  type: UPDATE_HOME_MULTIPLE,
  newValue: {
    status: 'none',
    inputText: '',
    outputText: null,
    inputRoman: null,
    outputRoman: null,
    outputSegments: null,
    detectedInputLang: null,
    inputDict: null,
    outputDict: null,
    suggestedInputLang: null,
    suggestedInputText: null,
  },
});

export const translate = () => ((dispatch, getState) => {
  const { settings, home } = getState();
  const { inputLang, outputLang, chinaMode } = settings;
  const { inputText } = home;

  if (inputText.length < 1) return;

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
  const { settings } = getState();
  const { realtime } = settings;

  dispatch({ type: UPDATE_INPUT_TEXT, inputText });

  if (inputText.length === 0) dispatch(clearHome());

  if (realtime === true) dispatch(translate());
});

export const translateWithInfo = (inputLang, outputLang, inputText) =>
  ((dispatch) => {
    dispatch({
      type: UPDATE_HOME_MULTIPLE,
      newValue: { inputLang, outputLang, inputText },
    });

    dispatch(translate());
  });
