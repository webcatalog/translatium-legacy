/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { CHANGE_ROUTE } from '../../../constants/actions';

import amplitude from '../../../amplitude';

import {
  ROUTE_HISTORY,
  ROUTE_PHRASEBOOK,
} from '../../../constants/routes';

export const changeRoute = (route) => (dispatch) => {
  if (route === ROUTE_HISTORY) {
    amplitude.getInstance().logEvent('go to history page');
  } else if (route === ROUTE_PHRASEBOOK) {
    amplitude.getInstance().logEvent('go to phrasebook page');
  }

  dispatch({
    type: CHANGE_ROUTE,
    route,
  });
};
