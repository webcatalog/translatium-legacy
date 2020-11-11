/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { UPDATE_ALERT_MESSAGE } from '../../../constants/actions';

export const closeAlert = () => ({
  type: UPDATE_ALERT_MESSAGE,
  message: null,
});

export const openAlert = (message) => ({
  type: UPDATE_ALERT_MESSAGE,
  message,
});
