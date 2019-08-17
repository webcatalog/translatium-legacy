import {
  UPDATE_IS_DARK_MODE,
  UPDATE_IS_FULL_SCREEN,
} from '../../../constants/actions';

export const updateIsFullScreen = (isFullScreen) => ({
  type: UPDATE_IS_FULL_SCREEN,
  isFullScreen,
});

export const updateIsDarkMode = (isDarkMode) => ({
  type: UPDATE_IS_DARK_MODE,
  isDarkMode,
});
