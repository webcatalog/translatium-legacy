import { SET_PREFERENCE, UPDATE_OUTPUT } from '../../../constants/actions';

import { requestSetPreference } from '../../../senders';

export const setPreference = (name, value) => ({
  type: SET_PREFERENCE,
  name,
  value,
});

export const toggleSetting = (name) => ((dispatch, getState) => {
  const value = !getState().preferences[name];
  requestSetPreference(name, value);
});


const runAfterLanguageChange = (language) => ((dispatch, getState) => {
  const { preferences } = getState();
  const { recentLanguages } = preferences;

  dispatch({
    type: UPDATE_OUTPUT,
    output: null,
  });

  if (!language) return;

  if (recentLanguages.indexOf(language) < 0 && language !== 'auto') {
    recentLanguages.unshift(language);
  }

  requestSetPreference('recentLanguages', recentLanguages.slice(0, 6));
});

export const swapLanguages = () => ((dispatch, getState) => {
  const state = getState();
  const { inputLang, outputLang } = state.preferences;
  const { output } = state.pages.home;

  if (inputLang === 'auto') {
    if (output && output.inputLang) {
      requestSetPreference('inputLang', outputLang);
      requestSetPreference('outputLang', output.inputLang === 'zh' ? 'zh-CN' : output.inputLang);
      dispatch(runAfterLanguageChange());
    }
    return;
  }

  requestSetPreference('inputLang', outputLang.startsWith('zh') ? 'zh' : outputLang);
  requestSetPreference('outputLang', inputLang === 'zh' ? 'zh-CN' : inputLang);
  dispatch(runAfterLanguageChange());
});

export const updateInputLang = (value) => ((dispatch, getState) => {
  if (getState().preferences.outputLang === value) { // newInputLang === outputLang
    dispatch(swapLanguages());
    return;
  }

  requestSetPreference('inputLang', value);
  dispatch(runAfterLanguageChange(value));
});

export const updateOutputLang = (value) => ((dispatch, getState) => {
  if (getState().preferences.inputLang === value) { // newOutputLang === inputLang
    dispatch(swapLanguages());
    return;
  }

  requestSetPreference('outputLang', value);
  dispatch(runAfterLanguageChange(value));
});
