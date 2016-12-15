import Immutable from 'immutable';

import { UPDATE_HISTORY } from '../constants/actions';

const initialState = {
  historyItems: Immutable.fromJS([]),
  canLoadMore: false,
  historyLoading: true,
};

const screen = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_HISTORY:
      return Object.assign({}, state, {
        historyItems: action.historyItems,
        canLoadMore: action.canLoadMore,
        historyLoading: action.historyLoading,
      });
    default:
      return state;
  }
};

export default screen;
