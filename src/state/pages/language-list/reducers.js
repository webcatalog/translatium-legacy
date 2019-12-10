import {
  UPDATE_LANGUAGE_LIST_SEARCH,
  UPDATE_LANGUAGE_LIST_MODE,
} from '../../../constants/actions';

const initialState = {
  search: '',
  type: 'inputLang',
};

const languageList = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_LANGUAGE_LIST_SEARCH:
      return { ...state, search: action.search };
    case UPDATE_LANGUAGE_LIST_MODE:
      return { ...state, mode: action.mode };
    default:
      return state;
  }
};

export default languageList;
