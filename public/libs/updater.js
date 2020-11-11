/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const { app, dialog, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');

const sendToAllWindows = require('./send-to-all-windows');
const { createMenu } = require('./menu');
const { getLocale } = require('./locales');

global.updateSilent = true;

global.updaterObj = {};

autoUpdater.on('checking-for-update', () => {
  global.updaterObj = {
    status: 'checking-for-update',
  };
  createMenu();
});

autoUpdater.on('update-available', (info) => {
  if (!global.updateSilent) {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(win, {
      title: getLocale('updateAvailable'),
      message: getLocale('updateAvailableDesc'),
      buttons: [getLocale('ok')],
      cancelId: 0,
      defaultId: 0,
    }).catch(console.log); // eslint-disable-line no-console
    global.updateSilent = true;
  }

  sendToAllWindows('log', info);

  global.updaterObj = {
    status: 'update-available',
    info,
  };
  createMenu();
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
    }).catch(console.log); // eslint-disable-line no-console
    global.updateSilent = true;
  }

  sendToAllWindows('log', info);

  global.updaterObj = {
    status: 'update-not-available',
    info,
  };
  createMenu();
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
    }).catch(console.log); // eslint-disable-line no-console
    global.updateSilent = true;
  }

  sendToAllWindows('log', err);
  global.updaterObj = {
    status: 'error',
    info: err,
  };
  createMenu();
});

autoUpdater.on('update-cancelled', () => {
  global.updaterObj = {
    status: 'update-cancelled',
  };
  createMenu();
});

autoUpdater.on('update-downloaded', (info) => {
  // workaround for AppImageLauncher
  // https://github.com/atomery/webcatalog/issues/634
  // https://github.com/electron-userland/electron-builder/issues/4046
  // https://github.com/electron-userland/electron-builder/issues/4046#issuecomment-670367840
  if (process.env.DESKTOPINTEGRATION === 'AppImageLauncher') {
    process.env.APPIMAGE = process.env.ARGV0;
  }

  global.updaterObj = {
    status: 'update-downloaded',
    info,
  };
  createMenu();

  const dialogOpts = {
    type: 'info',
    buttons: [getLocale('restart'), getLocale('later')],
    title: getLocale('applicationUpdate'),
    detail: getLocale('applicationUpdateDesc').replace('{version}', info.version),
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
    })
    .catch(console.log); // eslint-disable-line no-console
});
