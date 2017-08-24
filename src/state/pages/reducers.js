import { combineReducers } from 'redux';

import home from './home/reducers';
import ocr from './ocr/reducers';
import phrasebook from './phrasebook/reducers';

export default combineReducers({
  home,
  ocr,
  phrasebook,
});
