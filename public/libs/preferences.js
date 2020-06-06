const { app, nativeTheme, ipcMain } = require('electron');
const settings = require('electron-settings');

const sendToAllWindows = require('./send-to-all-windows');

const getDefaultRegistered = () => {
  if (!app.isPackaged) return true;

  // only check for license in non Mac App Store distribution or Linux
  if (process.platform === 'darwin' && !process.mas) {
    return false;
  }

  if (process.platform === 'linux') {
    return false;
  }

  // Mac App Store & Windows Store distributions use provided licensing systems
  return true;
};

// scope
const v = '2019';

const defaultPreferences = {
  alwaysOnTop: false,
  attachToMenubar: false,
  clearInputShortcut: 'mod+shift+d',
  inputLang: 'en',
  openOnMenubarShortcut: null,
  outputLang: 'zh',
  recentLanguages: ['en', 'zh'],
  registered: getDefaultRegistered(),
  showTransliteration: true,
  themeSource: 'system',
  translateClipboardOnShortcut: false,
  translateWhenPressingEnter: true,
};

const getPreferences = () => ({ ...defaultPreferences, ...settings.get(`preferences.${v}`) });

const getPreference = (name) => {
  if (settings.has(`preferences.${v}.${name}`)) {
    return settings.get(`preferences.${v}.${name}`);
  }
  return defaultPreferences[name];
};

const setPreference = (name, value) => {
  if (name === 'openOnMenubarShortcut') {
    ipcMain.emit('unset-show-menubar-shortcut', null, getPreference(name));
    ipcMain.emit('set-show-menubar-shortcut', null, value);
  }

  settings.set(`preferences.${v}.${name}`, value);
  sendToAllWindows('set-preference', name, value);

  if (name === 'themeSource') {
    nativeTheme.themeSource = value;
  }
};

const resetPreferences = () => {
  settings.deleteAll();

  const preferences = getPreferences();
  Object.keys(preferences).forEach((name) => {
    sendToAllWindows('set-preference', name, preferences[name]);
  });
};

module.exports = {
  getPreference,
  getPreferences,
  resetPreferences,
  setPreference,
};
