/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { CHANGE_ROUTE } from '../../../constants/actions';

export const changeRoute = (route) => (dispatch) => {
  dispatch({
    type: CHANGE_ROUTE,
    route,
  });
};
