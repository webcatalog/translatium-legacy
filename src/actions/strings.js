import { UPDATE_STRINGS } from '../constants/actions';

import enApp from '../strings/en-us.app.json';
import enLanguages from '../strings/en-us.languages.json';
import viApp from '../strings/vi-vn.app.json';
import viLanguages from '../strings/vi-vn.languages.json';

export const updateStrings = langId => (dispatch) => {
  let strings;
  switch (langId) {
    case 'vi-vn': {
      strings = { ...viApp, ...viLanguages };
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
