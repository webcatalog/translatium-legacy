import {
  UPDATE_SETTING,
} from '../constants/actions';

import { isOutput } from '../lib/languageUtils';

import { translate, clearHome } from './home';
import { initOcr } from './ocr';

export const updateSetting = (name, value) => ({
  type: UPDATE_SETTING,
  name, value,
});

const runAfterLanguageChange = (isOcr) => ((dispatch, getState) => {
  const { settings, ocr } = getState();
  const { realtime } = settings;
  const { inputFile } = ocr;

  if (isOcr === true) {
    dispatch(initOcr(inputFile));
  } else {
    if (realtime === true) dispatch(translate());
    else dispatch(clearHome());
  }
});

export const updateLanguage = (name, value, isOcr) => ((dispatch, getState) => {
  const { recentLanguages } = getState().settings;

  dispatch(updateSetting(name, value));
  dispatch(runAfterLanguageChange(isOcr));

  if (recentLanguages.indexOf(value) < 0 && value !== 'auto') {
    recentLanguages.unshift(value);
  }

  dispatch(updateSetting('recentLanguages', recentLanguages.slice(0, 6)));
});

export const swapLanguages = (isOcr) => ((dispatch, getState) => {
  const { inputLang, outputLang } = getState().settings;

  if (isOutput(inputLang) === false) return;

  dispatch(updateSetting('inputLang', outputLang));
  dispatch(updateSetting('outputLang', inputLang));

  dispatch(runAfterLanguageChange(isOcr));
});
