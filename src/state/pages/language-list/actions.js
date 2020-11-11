/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
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
