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

const runAfterLanguageChange = (isOcr, language) => ((dispatch, getState) => {
  const { settings, ocr } = getState();
  const { realtime, recentLanguages } = settings;
  const { inputFile } = ocr;

  if (isOcr === true) {
    dispatch(initOcr(inputFile));
  } else {
    if (realtime === true) dispatch(translate());
    else dispatch(clearHome());
  }

  if (!language) return;

  if (recentLanguages.indexOf(language) < 0 && language !== 'auto') {
    recentLanguages.unshift(language);
  }

  dispatch(updateSetting('recentLanguages', recentLanguages.slice(0, 6)));
});

export const updateInputLang = (value, isOcr) => ((dispatch) => {
  dispatch(updateSetting('inputLang', value));
  dispatch(runAfterLanguageChange(isOcr, value));
});

export const updateOutputLang = (value, isOcr) => ((dispatch) => {
  dispatch(updateSetting('outputLang', value));
  dispatch(runAfterLanguageChange(isOcr, value));
});

export const swapLanguages = (isOcr) => ((dispatch, getState) => {
  const { inputLang, outputLang } = getState().settings;

  if (isOutput(inputLang) === false) return;

  dispatch(updateSetting('inputLang', outputLang));
  dispatch(updateSetting('outputLang', inputLang));

  dispatch(runAfterLanguageChange(isOcr));
});
