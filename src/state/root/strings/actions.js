import { UPDATE_STRINGS } from '../../../constants/actions';

import deApp from '../../../strings/de.app.json';
import deLanguages from '../../../strings/de.languages.json';
import enApp from '../../../strings/en.app.json';
import enLanguages from '../../../strings/en.languages.json';
import ptApp from '../../../strings/pt_BR.app.json';
import ptLanguages from '../../../strings/pt_BR.languages.json';
import viApp from '../../../strings/vi.app.json';
import viLanguages from '../../../strings/vi.languages.json';
import plApp from '../../../strings/pl.app.json';
import plLanguages from '../../../strings/pl.languages.json';

export const updateStrings = langId => (dispatch) => {
  let strings;
  switch (langId.substring(0, 2)) {
    case 'de': {
      strings = { ...deApp, ...deLanguages };
      break;
    }
    case 'pt': {
      strings = { ...ptApp, ...ptLanguages };
      break;
    }
    case 'vi': {
      strings = { ...viApp, ...viLanguages };
      break;
    }
    case 'pl': {
      strings = { ...plApp, ...plLanguages };
      break;
    }
    default: {
      strings = { ...enApp, ...enLanguages };
      break;
    }
  }

  dispatch({
    type: UPDATE_STRINGS,
    strings,
  });
};
