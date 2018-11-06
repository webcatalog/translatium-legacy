import { SCREEN_RESIZE } from '../../../constants/actions';

/* global window remote */
const initialState = {
  screenWidth: typeof window === 'object' ? window.innerWidth : null,
  isMaximized: remote.getCurrentWindow().isMaximized(),
};

const screen = (state = initialState, action) => {
  switch (action.type) {
    case SCREEN_RESIZE:
      return Object.assign({}, state, {
        screenWidth: action.screenWidth,
        isMaximized: remote.getCurrentWindow().isMaximized(),
      });
    default:
      return state;
  }
};

export default screen;
