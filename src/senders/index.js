const { ipcRenderer } = window.require('electron');

export const requestShowAppMenu = (x, y) => ipcRenderer.send('request-show-app-menu', x, y);
export const requestOpenInBrowser = (url) => ipcRenderer.send('request-open-in-browser', url);
export const requestShowMessageBox = (message, type) => ipcRenderer.send('request-show-message-box', message, type);

// Preferences
export const getPreference = (name) => ipcRenderer.sendSync('get-preference', name);
export const getPreferences = () => ipcRenderer.sendSync('get-preferences');
export const requestSetPreference = (name, value) => ipcRenderer.send('request-set-preference', name, value);
export const requestResetPreferences = () => ipcRenderer.send('request-reset-preferences');
export const requestShowRequireRestartDialog = () => ipcRenderer.send('request-show-require-restart-dialog');

// Locale
export const getLocale = (id) => ipcRenderer.sendSync('get-locale', id);
export const getLocales = () => ipcRenderer.sendSync('get-locales');
export const getDisplayLanguages = () => ipcRenderer.sendSync('get-display-languages');

// Native Theme
export const getShouldUseDarkColors = () => ipcRenderer.sendSync('get-should-use-dark-colors');

// System Preferences
export const getSystemPreference = (name) => ipcRenderer.sendSync('get-system-preference', name);
export const getSystemPreferences = () => ipcRenderer.sendSync('get-system-preferences');
export const requestSetSystemPreference = (name, value) => ipcRenderer.send('request-set-system-preference', name, value);

// Fetch
export const nodeFetchBufferAsync = (...args) => ipcRenderer.invoke('node-fetch-buffer', ...args);
