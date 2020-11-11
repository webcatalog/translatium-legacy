/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { UPDATE_HISTORY_PAGE, UPDATE_HISTORY_PAGE_QUERY } from '../../../constants/actions';

const initialState = {
  items: [],
  canLoadMore: false,
  loading: true,
  query: '',
};

const history = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_HISTORY_PAGE_QUERY:
      return {
        ...state,
        query: action.query,
      };
    case UPDATE_HISTORY_PAGE:
      return {
        ...state,
        items: action.items,
        canLoadMore: action.canLoadMore,
        loading: action.loading,
      };
    default:
      return state;
  }
};

export default history;
