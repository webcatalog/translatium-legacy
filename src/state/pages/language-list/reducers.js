/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
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
