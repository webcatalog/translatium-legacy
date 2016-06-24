import { UPDATE_HANDWRITING_SUGGESTION_LIST } from '../constants/actions';

const initialState = {
  suggestionList: null,
};

const handwriting = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_HANDWRITING_SUGGESTION_LIST:
      return Object.assign({}, state, {
        suggestionList: action.suggestionList,
      });
    default:
      return state;
  }
};

export default handwriting;
