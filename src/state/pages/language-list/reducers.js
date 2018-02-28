import { UPDATE_LANGUAGE_LIST_SEARCH } from '../../../constants/actions';

const initialState = {
  search: '',
};

const languageList = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_LANGUAGE_LIST_SEARCH:
      return Object.assign({}, state, {
        search: action.search,
      });
    default:
      return state;
  }
};

export default languageList;
