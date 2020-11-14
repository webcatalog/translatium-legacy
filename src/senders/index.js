/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
export const requestShowAppMenu = (x, y) => window.ipcRenderer.send('request-show-app-menu', x, y);
export const requestOpenInBrowser = (url) => window.ipcRenderer.send('request-open-in-browser', url);
export const requestShowMessageBox = (message, type) => window.ipcRenderer.send('request-show-message-box', message, type);

// Preferences
export const getPreference = (name) => window.ipcRenderer.sendSync('get-preference', name);
export const getPreferences = () => window.ipcRenderer.sendSync('get-preferences');
export const requestSetPreference = (name, value) => window.ipcRenderer.send('request-set-preference', name, value);
export const requestResetPreferences = () => window.ipcRenderer.send('request-reset-preferences');
export const requestShowRequireRestartDialog = () => window.ipcRenderer.send('request-show-require-restart-dialog');

// Locale
export const getLocale = (id) => window.ipcRenderer.sendSync('get-locale', id);
export const getLocales = () => window.ipcRenderer.sendSync('get-locales');
export const getDisplayLanguages = () => window.ipcRenderer.sendSync('get-display-languages');

// Native Theme
export const getShouldUseDarkColors = () => window.ipcRenderer.sendSync('get-should-use-dark-colors');

// System Preferences
export const getSystemPreference = (name) => window.ipcRenderer.sendSync('get-system-preference', name);
export const getSystemPreferences = () => window.ipcRenderer.sendSync('get-system-preferences');
export const requestSetSystemPreference = (name, value) => window.ipcRenderer.send('request-set-system-preference', name, value);

// Fetch
export const nodeFetchBufferAsync = (...args) => window.ipcRenderer.invoke('node-fetch-buffer', ...args);
