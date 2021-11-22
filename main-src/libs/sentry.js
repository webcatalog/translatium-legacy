/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const { init } = require('@sentry/electron');

const isRenderer = (process && process.type === 'renderer');

init({
  dsn: process.env.ELECTRON_APP_SENTRY_DSN,
  // eslint-disable-next-line global-require
  release: isRenderer ? require('@electron/remote').app.getVersion() : require('electron').app.getVersion(),
});
