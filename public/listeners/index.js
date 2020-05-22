const {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} = require('electron');

const {
  getPreference,
  getPreferences,
  resetPreferences,
  setPreference,
} = require('../libs/preferences');

const {
  getSystemPreference,
  getSystemPreferences,
  setSystemPreference,
} = require('../libs/system-preferences');

const {
  getLocale,
  getLocales,
} = require('../libs/locales');

const loadListeners = () => {
  // Locale
  ipcMain.on('get-locale', (e, id) => {
    e.returnValue = getLocale(id);
  });

  ipcMain.on('get-locales', (e) => {
    e.returnValue = getLocales();
  });

  // System Preferences
  ipcMain.on('get-system-preference', (e, name) => {
    const val = getSystemPreference(name);
    e.returnValue = val;
  });

  ipcMain.on('get-system-preferences', (e) => {
    const preferences = getSystemPreferences();
    e.returnValue = preferences;
  });

  ipcMain.on('request-set-system-preference', (e, name, value) => {
    setSystemPreference(name, value);
  });

  // Preferences
  ipcMain.on('get-preference', (e, name) => {
    e.returnValue = getPreference(name);
  });

  ipcMain.on('get-preferences', (e) => {
    e.returnValue = getPreferences();
  });

  ipcMain.on('request-set-preference', (e, name, value) => {
    setPreference(name, value);
  });

  ipcMain.on('request-reset-preferences', () => {
    dialog.showMessageBox(BrowserWindow.getAllWindows()[0], {
      type: 'question',
      buttons: [getLocale('resetNow'), getLocale('cancel')],
      message: getLocale('resetDesc'),
      cancelId: 1,
    })
      .then(({ response }) => {
        if (response === 0) {
          resetPreferences();

          ipcMain.emit('request-show-require-restart-dialog');
        }
      })
      .catch(console.log); // eslint-disable-line no-console
  });

  ipcMain.on('request-show-require-restart-dialog', () => {
    if (process.mas) {
      return dialog.showMessageBox({
        type: 'question',
        buttons: [getLocale('quitNow'), getLocale('later')],
        message: getLocale('requireRestartDescMas'),
        cancelId: 1,
      })
        .then(({ response }) => {
          if (response === 0) {
            app.quit();
          }
        })
        .catch(console.log); // eslint-disable-line no-console
    }

    return dialog.showMessageBox({
      type: 'question',
      buttons: [getLocale('restartNow'), getLocale('later')],
      message: getLocale('requireRestartDesc'),
      cancelId: 1,
    }).then(({ response }) => {
      if (response === 0) {
        app.relaunch();
        app.exit(0);
      }
    })
    .catch(console.log); // eslint-disable-line
  });

  ipcMain.on('request-open-in-browser', (e, browserUrl) => {
    shell.openExternal(browserUrl);
  });

  ipcMain.on('request-show-message-box', (e, message, type) => {
    dialog.showMessageBox(BrowserWindow.getAllWindows()[0], {
      type: type || 'error',
      message,
      buttons: [getLocale('ok')],
      cancelId: 0,
      defaultId: 0,
    }).catch(console.log); // eslint-disable-line no-console
  });

  // Native Theme
  ipcMain.on('get-should-use-dark-colors', (e) => {
    e.returnValue = nativeTheme.shouldUseDarkColors;
  });
};

module.exports = loadListeners;
