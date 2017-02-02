import Immutable from 'immutable';

import { UPDATE_HISTORY } from '../constants/actions';

const initialState = {
  items: Immutable.fromJS([]),
  canLoadMore: false,
  loading: true,
};

const history = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_HISTORY:
      return Object.assign({}, state, {
        items: action.items,
        canLoadMore: action.canLoadMore,
        loading: action.loading,
      });
    default:
      return state;
  }
};

export default history;
