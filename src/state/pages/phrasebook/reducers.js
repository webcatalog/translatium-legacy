/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { UPDATE_PHRASEBOOK, UPDATE_PHRASEBOOK_QUERY } from '../../../constants/actions';

const initialState = {
  items: [],
  canLoadMore: false,
  loading: true,
  query: '',
};

const phrasebook = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PHRASEBOOK_QUERY:
      return {
        ...state,
        query: action.query,
      };
    case UPDATE_PHRASEBOOK:
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

export default phrasebook;
