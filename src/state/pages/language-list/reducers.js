import { combineReducers } from 'redux';

import {
  CHANGE_ROUTE,
  UPDATE_LANGUAGE_LIST_SEARCH,
  UPDATE_LANGUAGE_LIST_MODE,
} from '../../../constants/actions';

const search = (state = '', action) => {
  switch (action.type) {
    case CHANGE_ROUTE: return '';
    case UPDATE_LANGUAGE_LIST_SEARCH: return action.search;
    default: return state;
  }
};


const mode = (state = 'inputLang', action) => {
  switch (action.type) {
    case UPDATE_LANGUAGE_LIST_MODE: return action.mode;
    default: return state;
  }
};

export default combineReducers({
  search,
  mode,
});
