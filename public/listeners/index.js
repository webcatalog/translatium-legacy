const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
} = require('electron');

const {
  getPreference,
  getPreferences,
  resetPreferences,
  setPreference,
} = require('../libs/preferences');

const loadListeners = () => {
  // Preferences
  ipcMain.on('get-preference', (e, name) => {
    const val = getPreference(name);
    e.returnValue = val;
  });

  ipcMain.on('get-preferences', (e) => {
    const preferences = getPreferences();
    e.returnValue = preferences;
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

  ipcMain.on('request-show-message-box', (e, message, type) => {
    dialog.showMessageBox(BrowserWindow.getAllWindows()[0], {
      type: type || 'error',
      message,
    });
  });
};

module.exports = loadListeners;
