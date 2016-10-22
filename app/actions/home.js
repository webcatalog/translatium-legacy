import Immutable from 'immutable';

import {
  UPDATE_INPUT_TEXT, UPDATE_OUTPUT, UPDATE_IME_MODE,
} from '../constants/actions';

import translateText from '../libs/translateText';

export const translate = () => ((dispatch, getState) => {
  const { settings, home } = getState();
  const { inputLang, outputLang } = settings;
  const { inputText } = home;

  // Safe
  if (inputText.trim().length < 1) return;

  dispatch({
    type: UPDATE_OUTPUT,
    output: Immutable.fromJS({ status: 'loading' }),
  });

  translateText(inputLang, outputLang, inputText)
    .then((result) => {
      const r = result;
      r.status = 'done';
      r.inputLang = inputLang;
      r.outputLang = outputLang;
      r.inputText = inputText;
      dispatch({
        type: UPDATE_OUTPUT,
        output: Immutable.fromJS(r),
      });
    })
    .catch(() => {
      dispatch({
        type: UPDATE_OUTPUT,
        output: Immutable.fromJS({ status: 'failed' }),
      });
    });
});

export const updateInputText = (inputText, selectionStart, selectionEnd) =>
  ((dispatch, getState) => {
    const realtime = getState().settings.realtime;

    dispatch({ type: UPDATE_INPUT_TEXT, inputText, selectionStart, selectionEnd });

    if (realtime === true && inputText.trim().length > 0) {
      dispatch(translate());
    } else {
      dispatch({
        type: UPDATE_OUTPUT,
        output: null,
      });
    }
  });

export const updateImeMode = imeMode => ({
  type: UPDATE_IME_MODE,
  imeMode,
});
