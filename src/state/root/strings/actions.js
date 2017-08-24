import { UPDATE_STRINGS } from '../../../constants/actions';

import enApp from '../../../strings/en-us.app.json';
import enLanguages from '../../../strings/en-us.languages.json';
import viApp from '../../../strings/vi.app.json';
import viLanguages from '../../../strings/vi.languages.json';

export const updateStrings = langId => (dispatch) => {
  let strings;
  switch (langId.substring(0, 2)) {
    case 'vi': {
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
