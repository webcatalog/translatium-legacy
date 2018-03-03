import { combineReducers } from 'redux';

import home from './home/reducers';
import languageList from './language-list/reducers';
import ocr from './ocr/reducers';
import phrasebook from './phrasebook/reducers';
import settings from './settings/reducers';

export default combineReducers({
  home,
  languageList,
  ocr,
  phrasebook,
  settings,
});
