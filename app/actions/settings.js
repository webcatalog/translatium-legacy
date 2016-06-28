import {
  UPDATE_SETTING,
} from '../constants/actions';

import { isOutput } from '../lib/languageUtils';

import { translate, clearHome } from './home';

export const updateSetting = (name, value) => ({
  type: UPDATE_SETTING,
  name, value,
});

const runAfterLanguageChange = () => ((dispatch, getState) => {
  const { settings } = getState();
  const { realtime } = settings;

  if (realtime === true) dispatch(translate());
  else dispatch(clearHome());
});

export const updateLanguage = (name, value) => ((dispatch) => {
  dispatch(updateSetting(name, value));
  dispatch(runAfterLanguageChange());
});

export const swapLanguages = () => ((dispatch, getState) => {
  const { inputLang, outputLang } = getState().settings;

  if (isOutput(inputLang) === false) return;

  dispatch(updateSetting('inputLang', outputLang));
  dispatch(updateSetting('outputLang', inputLang));

  dispatch(runAfterLanguageChange());
});
