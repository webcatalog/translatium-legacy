import {
  UPDATE_LANGUAGE_LIST_SEARCH,
  UPDATE_LANGUAGE_LIST_MODE,
} from '../../../constants/actions';

export const updateLanguageListSearch = (search) => ({
  type: UPDATE_LANGUAGE_LIST_SEARCH,
  search,
});

export const updateLanguageListMode = (mode) => ({
  type: UPDATE_LANGUAGE_LIST_MODE,
  mode,
});
