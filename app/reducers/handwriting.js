import { UPDATE_HANDWRITING_SUGGESTION_LIST } from '../constants/actions';

const initialState = {
  suggestions: null,
};

const handwriting = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_HANDWRITING_SUGGESTION_LIST:
      return Object.assign({}, state, {
        suggestions: action.suggestions,
      });
    default:
      return state;
  }
};

export default handwriting;
