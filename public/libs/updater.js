const { app, dialog, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');

const sendToAllWindows = require('./send-to-all-windows');
const createMenu = require('./create-menu');
const { getLocale } = require('./locales');

global.updateSilent = true;
global.updateAvailable = false;

autoUpdater.on('update-available', (info) => {
  if (!global.updateSilent) {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(win, {
      title: getLocale('updateAvailable'),
      message: getLocale('updateAvailableDesc'),
      buttons: [getLocale('ok')],
      cancelId: 0,
      defaultId: 0,
    });
    global.updateSilent = true;
  }

  sendToAllWindows('log', info);
});

autoUpdater.on('update-not-available', (info) => {
  if (!global.updateSilent) {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(win, {
      title: getLocale('noUpdates'),
      message: getLocale('noUpdatesDesc'),
      buttons: [getLocale('ok')],
      cancelId: 0,
      defaultId: 0,
    });
    global.updateSilent = true;
  }

  sendToAllWindows('log', info);
});

autoUpdater.on('error', (err) => {
  if (!global.updateSilent) {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(win, {
      title: getLocale('failedToCheckForUpdates'),
      message: getLocale('failedToCheckForUpdatesDesc'),
      buttons: [getLocale('ok')],
      cancelId: 0,
      defaultId: 0,
    });
    global.updateSilent = true;
  }

  sendToAllWindows('log', err);
});

autoUpdater.on('update-downloaded', (info) => {
  global.updateDownloaded = true;

  createMenu();

  const dialogOpts = {
    type: 'info',
    buttons: [getLocale('restart'), getLocale('later')],
    title: getLocale('applicationUpdate'),
    detail: getLocale('applicationUpdate').replace('$VERSION', info.version),
    cancelId: 1,
  };

  const win = BrowserWindow.getFocusedWindow();
  dialog.showMessageBox(win, dialogOpts)
    .then(({ response }) => {
      if (response === 0) {
        // Fix autoUpdater.quitAndInstall() does not quit immediately
        // https://github.com/electron/electron/issues/3583
        // https://github.com/electron-userland/electron-builder/issues/1604
        setImmediate(() => {
          app.removeAllListeners('window-all-closed');
          if (win != null) {
            win.close();
          }
          autoUpdater.quitAndInstall(false);
        });
      }
    });
});

autoUpdater.checkForUpdates();
