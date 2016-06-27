import {
  UPDATE_SETTING,
} from '../constants/actions';

import { isOutput } from '../lib/languageUtils';

import { translate, clearHome } from './home';

export const updateSetting = (name, value) => ({
  type: UPDATE_SETTING,
  name, value,
});

export const updateLanguage = (name, value) => ((dispatch, getState) => {
  const { realtime } = getState().settings;

  dispatch(updateSetting(name, value));

  if (realtime === true) dispatch(translate());
  else dispatch(clearHome());
});

export const swapLanguages = () => ((dispatch, getState) => {
  const { inputLang, outputLang, realtime } = getState().settings;

  if (isOutput(inputLang) === false) return;

  dispatch(updateSetting('inputLang', outputLang));
  dispatch(updateSetting('outputLang', inputLang));

  if (realtime === true) dispatch(translate());
  else dispatch(clearHome());
});
