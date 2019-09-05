import { UPDATE_LOCALE } from '../../../constants/actions';

const initialState = {};

const locale = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_LOCALE:
      return { ...state, ...action.locale };
    default:
      return state;
  }
};

export default locale;
