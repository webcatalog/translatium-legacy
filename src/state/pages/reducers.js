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
