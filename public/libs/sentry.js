/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const electron = require('electron');
const { init } = require('@sentry/electron');

const isRenderer = (process && process.type === 'renderer');

init({
  dsn: 'https://f7ea6d9ea90543a78848d2651be864ce@o476721.ingest.sentry.io/5516769',
  release: isRenderer ? electron.remote.app.getVersion() : electron.app.getVersion(),
});
