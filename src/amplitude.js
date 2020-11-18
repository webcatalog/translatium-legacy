/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import amplitude from 'amplitude-js';
import { v5 as uuidv5 } from 'uuid';

amplitude.getInstance().init(process.env.REACT_APP_AMPLITUDE_API_KEY);
amplitude.getInstance().setVersionName(window.remote.app.getVersion());

// custom device id based on WebCatalog code
// to have some control over device id
if (window.machineId) {
  // unique namespace for translatium
  const DEVICE_ID_NAMESPACE = '0a641322-b40e-4a51-aa9f-3c16e91f4db2';
  const deviceId = uuidv5(window.machineId, DEVICE_ID_NAMESPACE);
  amplitude.getInstance().setDeviceId(deviceId);

  amplitude.getInstance().logEvent('EVENT_NAME_HERE');
}

export default amplitude;
