/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { OPEN_SNACKBAR, CLOSE_SNACKBAR } from '../../../constants/actions';

const initialState = {
  open: false,
  message: null,
};

const snackbar = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_SNACKBAR:
      return {
        ...state,
        open: true,
        message: action.message,
      };
    case CLOSE_SNACKBAR:
      return { ...state, open: false };
    default:
      return state;
  }
};

export default snackbar;
