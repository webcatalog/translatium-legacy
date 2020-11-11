/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { SCREEN_RESIZE } from '../../../constants/actions';

const initialState = {
  screenWidth: typeof window === 'object' ? window.innerWidth : null,
};

const screen = (state = initialState, action) => {
  switch (action.type) {
    case SCREEN_RESIZE:
      return { ...state, screenWidth: action.screenWidth };
    default:
      return state;
  }
};

export default screen;
