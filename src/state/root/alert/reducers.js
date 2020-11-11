/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { UPDATE_ALERT_MESSAGE } from '../../../constants/actions';

const initialState = {
  message: null,
};

const alert = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ALERT_MESSAGE:
      return { ...state, message: action.message };
    default:
      return state;
  }
};

export default alert;
