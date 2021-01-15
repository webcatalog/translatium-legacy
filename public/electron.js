/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint import/no-unresolved: [2, { ignore: ['electron'] }] */
/* eslint-disable import/no-extraneous-dependencies */

const {
  BrowserWindow,
  Menu,
  Tray,
  app,
  clipboard,
  dialog,
  globalShortcut,
  ipcMain,
  nativeImage,
  nativeTheme,
  shell,
} = require('electron');
const isDev = require('electron-is-dev');
const settings = require('electron-settings');

settings.configure({
  fileName: 'Settings', // backward compatible with electron-settings@3
});

const path = require('path');
const url = require('url');
const { menubar } = require('menubar');
const windowStateKeeper = require('electron-window-state');

// Activate the Sentry Electron SDK as early as possible in every process.
if (!isDev) {
  // eslint-disable-next-line global-require
  require('./libs/sentry');
}

const { createMenu, showMenu } = require('./libs/menu');
const loadListeners = require('./listeners');
const { getPreference } = require('./libs/preferences');
const { initLocales, getLocale } = require('./libs/locales');
const sendToAllWindows = require('./libs/send-to-all-windows');
const setContextMenu = require('./libs/set-context-menu');
const isMacOs11 = require('./libs/is-mac-os-11');

// we only need updater for AppImage
if (process.platform === 'linux' && process.env.SNAP == null) {
  // eslint-disable-next-line global-require
  require('./libs/updater');
}

// see https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mb;
let mainWindow;

// app.requestSingleInstanceLock doesnt work for signed mas builds (Mac App Store)
// see https://github.com/electron/electron/issues/15958
const gotTheLock = process.mas || app.requestSingleInstanceLock();

app.on('second-instance', () => {
  if (mainWindow != null) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (!gotTheLock) {
  app.quit();
} else {
  // make sure "Settings" file exists
  // if not, ignore this chunk of code
  // as using electron-settings before app.on('ready') and "Settings" is created
  // would return error
  // https://github.com/nathanbuchar/electron-settings/issues/111
  const useHardwareAcceleration = getPreference('useHardwareAcceleration');
  if (!useHardwareAcceleration) {
    app.disableHardwareAcceleration();
  }

  // mock app.whenReady
  let trulyReady = false;
  ipcMain.once('truly-ready', () => { trulyReady = true; });
  const whenTrulyReady = () => {
    if (trulyReady) return Promise.resolve();
    return new Promise((resolve) => {
      ipcMain.once('truly-ready', () => {
        trulyReady = true;
        resolve();
      });
    });
  };

  // Register protocol
  // needed for PopClip support
  // incompatible with snap
  // see https://forum.snapcraft.io/t/dbus-error/4969/9
  if (process.platform === 'darwin') {
    app.setAsDefaultProtocolClient('translatium');
  }

  // Load listeners
  loadListeners();

  const REACT_PATH = isDev ? 'http://localhost:3000' : `file://${path.resolve(__dirname, 'index.html')}`;

  const createWindowAsync = () => new Promise((resolve) => {
    const updaterEnabled = process.env.SNAP == null && !process.mas && !process.windowsStore;
    const attachToMenubar = getPreference('attachToMenubar');
    global.attachToMenubar = attachToMenubar;
    if (attachToMenubar) {
      // setImage after Tray instance is created to avoid
      // "Segmentation fault (core dumped)" bug on Linux
      // https://github.com/electron/electron/issues/22137#issuecomment-586105622
      // https://github.com/quanglam2807/translatium/issues/164
      const tray = new Tray(nativeImage.createEmpty());
      // icon template is not supported on Windows & Linux
      const iconPath = path.resolve(__dirname, 'images', process.platform === 'darwin' ? 'menubarTemplate.png' : 'menubar.png');
      tray.setImage(iconPath);

      const menubarWindowState = windowStateKeeper({
        file: 'window-state-menubar.json',
        defaultWidth: 400,
        defaultHeight: 500,
      });

      mb = menubar({
        index: REACT_PATH,
        tray,
        preloadWindow: true,
        browserWindow: {
          alwaysOnTop: getPreference('alwaysOnTop'),
          width: menubarWindowState.width,
          height: menubarWindowState.height,
          minWidth: 400,
          minHeight: 500,
          webPreferences: {
            enableRemoteModule: true,
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload', 'menubar.js'),
          },
        },
      });

      mb.on('ready', () => {
        mb.tray.on('right-click', () => {
          const contextMenu = Menu.buildFromTemplate([
            {
              label: getLocale('aboutApp').replace('{appName}', app.name),
              click: () => {
                sendToAllWindows('open-dialog-about');
                mb.showWindow();
              },
            },
            {
              type: 'separator',
              visible: updaterEnabled,
            },
            {
              label: getLocale('checkForUpdates'),
              click: () => {
                global.updateSilent = false;
                ipcMain.emit('request-check-for-updates');
              },
              visible: updaterEnabled,
            },
            { type: 'separator' },
            {
              label: getLocale('preferencesMenuItem'),
              click: () => {
                sendToAllWindows('go-to-preferences');
                mb.showWindow();
              },
            },
            { type: 'separator' },
            {
              label: getLocale('quit'),
              click: () => {
                mb.app.quit();
              },
            },
          ]);
          mb.tray.popUpContextMenu(contextMenu);
        });

        resolve();
      });

      ipcMain.on('unset-show-menubar-shortcut', (e, combinator) => {
        if (combinator) {
          try {
            globalShortcut.unregister(combinator);
          } catch (err) {
            console.log(err); // eslint-disable-line no-console
          }
        }
      });

      let isHidden = true;

      mb.on('after-create-window', () => {
        menubarWindowState.manage(mb.window);
      });

      mb.on('show', () => {
        isHidden = false;
      });

      mb.on('hide', () => {
        isHidden = true;
      });

      ipcMain.on('set-show-menubar-shortcut', (e, combinator) => {
        if (!combinator) return;
        globalShortcut.register(combinator, () => {
          if (isHidden) {
            mb.showWindow();
            const translateClipboardOnShortcut = getPreference('translateClipboardOnShortcut');
            if (translateClipboardOnShortcut) {
              const text = clipboard.readText();
              if (text.length > 0) {
                mb.window.send('set-input-text', text);
              }
            }
          } else {
            mb.hideWindow();
          }
        });
      });

      const openOnMenubarShortcut = getPreference('openOnMenubarShortcut');
      ipcMain.emit('set-show-menubar-shortcut', null, openOnMenubarShortcut);
    } else {
      // Create the browser window.
      const mainWindowState = windowStateKeeper({
        defaultWidth: 400,
        defaultHeight: 500,
      });

      const winOpts = {
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 400,
        minHeight: 500,
        titleBarStyle: 'hidden',
        autoHideMenuBar: false,
        show: false,
        frame: process.platform === 'darwin',
        webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          preload: path.join(__dirname, 'preload', 'default.js'),
        },
      };

      // manually set dock icon for AppImage
      // Snap icon is set correct already so no need to intervene
      const icon = process.platform === 'linux' && process.env.SNAP == null ? path.resolve(__dirname, 'images', 'icon-linux.png') : undefined;
      // winOpts.icon cannot be set to undefined
      // as it'd crash Electron on macOS
      // https://github.com/electron/electron/issues/27303#issuecomment-759501184
      if (icon) {
        winOpts.icon = icon;
      }

      mainWindow = new BrowserWindow(winOpts);
      mainWindowState.manage(mainWindow);

      mainWindow.on('enter-full-screen', () => {
        mainWindow.webContents.send('set-is-full-screen', true);
      });
      mainWindow.on('leave-full-screen', () => {
        mainWindow.webContents.send('set-is-full-screen', false);
      });

      mainWindow.on('maximize', () => {
        mainWindow.webContents.send('set-is-maximized', true);
      });
      mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('set-is-maximized', false);
      });

      // Emitted when the window is closed.
      mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        createMenu();
      });

      const { wasOpenedAsHidden } = app.getLoginItemSettings();
      if (!wasOpenedAsHidden) {
        mainWindow.once('ready-to-show', () => {
          mainWindow.show();
        });
      }

      // ensure redux is loaded first
      // if not, redux might not be able catch changes sent from ipcMain
      mainWindow.webContents.once('did-stop-loading', () => {
        resolve();
      });

      // and load the index.html of the app.
      mainWindow.loadURL(REACT_PATH);
    }
  }).then(() => {
    // trigger whenTrulyReady;
    ipcMain.emit('truly-ready');
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    global.isMacOs11 = isMacOs11();

    initLocales();

    const themeSource = getPreference('themeSource');
    nativeTheme.themeSource = themeSource;

    // Register an event listener.
    // When ipcRenderer sends mouse click co-ordinates, show menu at that position.
    // https://dev.to/saisandeepvaddi/creating-a-custom-menu-bar-in-electron-1pi3
    ipcMain.on('request-show-app-menu', (e, x, y) => {
      if (mainWindow) {
        showMenu(mainWindow, x, y);
      }
    });

    createWindowAsync()
      .then(() => {
        if (isDev) return; // dev environment
        // Mac
        if (process.platform === 'darwin' && !process.mas) {
          dialog.showMessageBox({
            type: 'question',
            buttons: ['Learn More...', 'OK'],
            message: 'The direct download version of Translatium will no longer be updated. Please get the app from the Mac App Store instead.',
            cancelId: 1,
          })
            .then(({ response }) => {
              if (response === 0) {
                shell.openExternal('https://translatium.app/download/mac?utm_source=mac-dmg');
              }
            })
            .catch(console.log); // eslint-disable-line no-console
        // Windows
        } else if (process.platform === 'win32' && !process.windowsStore) {
          dialog.showMessageBox({
            type: 'question',
            buttons: ['Learn More...', 'OK'],
            message: 'The direct download version of Translatium will no longer be updated. Please get the app from the Microsoft Store instead.',
            cancelId: 1,
          })
            .then(({ response }) => {
              if (response === 0) {
                shell.openExternal('https://translatium.app/download/windows?utm_source=windows-nsis');
              }
            })
            .catch(console.log); // eslint-disable-line no-console
        }
      });
    createMenu();
    setContextMenu();

    nativeTheme.addListener('updated', () => {
      sendToAllWindows('native-theme-updated');
    });

    ipcMain.emit('request-check-for-updates');
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    app.whenReady()
      .then(() => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        const attachToMenubar = getPreference('attachToMenubar');

        if (attachToMenubar) {
          if (mb == null) {
            createWindowAsync();
          } else {
            mb.on('ready', () => {
              mb.showWindow();
            });
          }
        } else if (mainWindow == null) {
          createWindowAsync();
        } else {
          mainWindow.show();
        }
      });
  });

  app.on('open-url', (e, urlStr) => {
    e.preventDefault();

    whenTrulyReady()
      .then(() => {
        if (urlStr.startsWith('translatium://')) {
          const urlObj = url.parse(urlStr, true);
          const text = decodeURIComponent(urlObj.query.text || '');

          const attachToMenubar = getPreference('attachToMenubar');
          if (attachToMenubar) {
            if (mb && mb.window) {
              mb.window.send('go-to-home');
              mb.window.send('set-input-lang', 'auto');
              mb.window.send('set-input-text', text);
              mb.showWindow();
            }
          } else if (mainWindow) {
            mainWindow.send('go-to-home');
            mainWindow.send('set-input-lang', 'auto');
            mainWindow.send('set-input-text', text);
            mainWindow.show();
          }
        }
      });
  });
}
