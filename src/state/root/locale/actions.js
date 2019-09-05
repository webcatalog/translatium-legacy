import { UPDATE_LOCALE } from '../../../constants/actions';

import enStrings from '../../../strings/en.json';
import viStrings from '../../../strings/vi.json';

export const updateLocale = (langId) => (dispatch) => {
  let strings;
  switch (langId.substring(0, 2)) {
    case 'vi': {
      strings = viStrings;
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
