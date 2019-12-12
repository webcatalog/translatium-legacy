const {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  shell,
} = require('electron');

const translateWithGoogle = require('@vitalets/google-translate-api');

const {
  getPreference,
  getPreferences,
  resetPreferences,
  setPreference,
} = require('../libs/preferences');

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
    }, (response) => {
      if (response === 0) {
        resetPreferences();

        ipcMain.emit('request-show-require-restart-dialog');
      }
    });
  });

  ipcMain.on('request-show-require-restart-dialog', () => {
    dialog.showMessageBox({
      type: 'question',
      buttons: [getLocale('quitNow'), getLocale('later')],
      message: getLocale('requireRestartDesc'),
      cancelId: 1,
    }, (response) => {
      if (response === 0) {
        app.quit();
      }
    });
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
    });
  });

  ipcMain.on('translate-with-google', (e, ...args) => {
    translateWithGoogle(...args)
      .then((res) => {
        e.returnValue = res;
      }).catch((err) => {
        e.returnValue = err;
      });
  });
};

module.exports = loadListeners;
