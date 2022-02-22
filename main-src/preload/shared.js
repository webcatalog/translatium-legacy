/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
require('source-map-support').install();
const {
  ipcRenderer,
  webFrame,
  desktopCapturer,
} = require('electron');
const remote = require('@electron/remote');

webFrame.setVisualZoomLevelLimits(1, 1);

window.remote = remote;
window.ipcRenderer = ipcRenderer;
window.desktopCapturer = desktopCapturer;

window.macPermissions = process.platform === 'darwin' ? require('node-mac-permissions') : null;
