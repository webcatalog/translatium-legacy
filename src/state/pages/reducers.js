/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { combineReducers } from 'redux';

import history from './history/reducers';
import home from './home/reducers';
import languageList from './language-list/reducers';
import ocr from './ocr/reducers';
import phrasebook from './phrasebook/reducers';
import preferences from './preferences/reducers';

export default combineReducers({
  history,
  home,
  languageList,
  ocr,
  phrasebook,
  preferences,
});
