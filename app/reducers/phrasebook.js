import { UPDATE_PHRASEBOOK } from '../constants/actions';

const initialState = {
  phrasebookItems: [],
  canLoadMore: false,
  phrasebookLoading: true,
};

const screen = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PHRASEBOOK:
      return Object.assign({}, state, {
        phrasebookItems: action.phrasebookItems,
        canLoadMore: action.canLoadMore,
        phrasebookLoading: action.phrasebookLoading,
      });
    default:
      return state;
  }
};

export default screen;
