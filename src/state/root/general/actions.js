import {
  UPDATE_SHOULD_USE_DARK_COLORS,
  UPDATE_THEME_SOURCE,
  UPDATE_IS_FULL_SCREEN,
} from '../../../constants/actions';

export const updateIsFullScreen = (isFullScreen) => ({
  type: UPDATE_IS_FULL_SCREEN,
  isFullScreen,
});

export const updateShouldUseDarkColors = (shouldUseDarkColors) => ({
  type: UPDATE_SHOULD_USE_DARK_COLORS,
  shouldUseDarkColors,
});

export const updateThemeSource = (themeSource) => ({
  type: UPDATE_THEME_SOURCE,
  themeSource,
});
