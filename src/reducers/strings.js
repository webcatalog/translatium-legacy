import { UPDATE_STRINGS } from '../constants/actions';

const initialState = {};

const strings = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_STRINGS:
      return Object.assign({}, state, action.strings);
    default:
      return state;
  }
};

export default strings;
