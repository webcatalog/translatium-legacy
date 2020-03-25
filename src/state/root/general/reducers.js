import { combineReducers } from 'redux';

import {
  UPDATE_SHOULD_USE_DARK_COLORS,
  UPDATE_THEME_SOURCE,
  UPDATE_IS_FULL_SCREEN,
} from '../../../constants/actions';

import {
  getThemeSource,
  getShouldUseDarkColors,
} from '../../../senders';

const { remote } = window.require('electron');

const isFullScreen = (state = remote.getCurrentWindow().isFullScreen(), action) => {
  switch (action.type) {
    case UPDATE_IS_FULL_SCREEN: return action.isFullScreen;
    default: return state;
  }
};

const shouldUseDarkColors = (state = getShouldUseDarkColors(), action) => {
  switch (action.type) {
    case UPDATE_SHOULD_USE_DARK_COLORS: return action.shouldUseDarkColors;
    default: return state;
  }
};

const themeSource = (state = getThemeSource(), action) => {
  switch (action.type) {
    case UPDATE_THEME_SOURCE: return action.themeSource;
    default: return state;
  }
};


export default combineReducers({
  shouldUseDarkColors,
  themeSource,
  isFullScreen,
});
