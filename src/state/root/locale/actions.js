import { UPDATE_LOCALE } from '../../../constants/actions';

import enStrings from '../../../strings/en.json';
import viStrings from '../../../strings/vi.json';
import esStrings from '../../../strings/es.json';
import itStrings from '../../../strings/it.json';
import deStrings from '../../../strings/de.json';
import plStrings from '../../../strings/pl.json';
import ptStrings from '../../../strings/pt.json';
import zhCNStrings from '../../../strings/zh-CN.json';

export const updateLocale = (langId) => (dispatch) => {
  const processedLangId = langId.substring(0, 2) !== 'zh' ? langId.substring(0, 2) : langId;
  let strings;
  switch (processedLangId) {
    case 'vi': {
      strings = viStrings;
      break;
    }
    case 'es': {
      strings = esStrings;
      break;
    }
    case 'it': {
      strings = itStrings;
      break;
    }
    case 'de': {
      strings = deStrings;
      break;
    }
    case 'pl': {
      strings = plStrings;
      break;
    }
    case 'pt': {
      strings = ptStrings;
      break;
    }
    case 'zh-CN': {
      strings = zhCNStrings;
      break;
    }

    default: {
      strings = enStrings;
      break;
    }
  }

  dispatch({
    type: UPDATE_LOCALE,
    locale: strings,
  });
};
