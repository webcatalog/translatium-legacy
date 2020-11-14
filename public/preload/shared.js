/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const {
  remote,
  ipcRenderer,
  webFrame,
  desktopCapturer,
} = require('electron');
const isDev = require('electron-is-dev');

// Activate the Sentry Electron SDK as early as possible in every process.
if (!isDev) {
  // eslint-disable-next-line global-require
  require('../libs/sentry');
}

window.remote = remote;
window.ipcRenderer = ipcRenderer;
window.desktopCapturer = desktopCapturer;

webFrame.setVisualZoomLevelLimits(1, 1);
