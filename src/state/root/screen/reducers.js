import { SCREEN_RESIZE } from '../../../constants/actions';

/* global window */
const initialState = {
  screenWidth: typeof window === 'object' ? window.innerWidth : null,
};

const screen = (state = initialState, action) => {
  switch (action.type) {
    case SCREEN_RESIZE:
      return Object.assign({}, state, {
        screenWidth: action.screenWidth,
      });
    default:
      return state;
  }
};

export default screen;
