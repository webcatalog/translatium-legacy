const {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  shell,
} = require('electron');

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
      buttons: ['Reset Now', 'Cancel'],
      message: 'Are you sure? All preferences will be restored to their original defaults. This action cannot be undone.',
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
      buttons: ['Quit Now', 'Later'],
      message: 'You need to quit and then manually restart the app for this change to take affect.',
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
      buttons: ['OK'],
      cancelId: 0,
      defaultId: 0,
    });
  });
};

module.exports = loadListeners;
