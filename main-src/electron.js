/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint import/no-unresolved: [2, { ignore: ['electron'] }] */
/* eslint-disable import/no-extraneous-dependencies */
require('source-map-support').install();

const {
  BrowserWindow,
  Menu,
  Tray,
  app,
  clipboard,
  globalShortcut,
  ipcMain,
  nativeImage,
  nativeTheme,
} = require('electron');
const settings = require('electron-settings');
const electronRemote = require('@electron/remote/main');

electronRemote.initialize();

settings.configure({
  fileName: 'Settings', // backward compatible with electron-settings@3
});

const path = require('path');
const { URL } = require('url');
const { menubar } = require('menubar');
const windowStateKeeper = require('electron-window-state');

const { getPreference, resetPreference } = require('./libs/preferences');

const { createMenu, showMenu } = require('./libs/menu');
const loadListeners = require('./listeners');
const { initLocales, getLocale } = require('./libs/locales');
const sendToAllWindows = require('./libs/send-to-all-windows');
const setContextMenu = require('./libs/set-context-menu');
const isMacOs11 = require('./libs/is-mac-os-11');

// we only need updater for standalone builds (AppImage, NSIS, DMG)
if (process.env.SNAP == null && !process.mas && !process.windowsStore) {
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
  if (process.platform === 'darwin' && process.env.NODE_ENV === 'production') {
    app.setAsDefaultProtocolClient('translatium');
  }

  const handleOpenUrl = (urlStr) => {
    if (urlStr && urlStr.startsWith('translatium://')) {
      const urlObj = new URL(urlStr);
      const text = urlObj.searchParams.get('text') || '';

      if (global.attachToMenubar) {
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
  };

  const handleArgv = (argv) => {
    if (argv.length <= 1) return;
    const urlStr = argv.find((a) => a.startsWith('translatium://'));
    if (urlStr) {
      handleOpenUrl(urlStr);
    }
  };

  // Load listeners
  loadListeners();

  const REACT_PATH = process.env.NODE_ENV === 'production'
    ? `file://${path.resolve(__dirname, 'index.html')}`
    : 'http://localhost:3000';

  const createWindowAsync = () => new Promise((resolve) => {
    const updaterEnabled = process.env.SNAP == null && !process.mas && !process.windowsStore;
    global.attachToMenubar = getPreference('attachToMenubar');
    if (global.attachToMenubar) {
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
        // https://github.com/webcatalog/translatium-desktop/issues/291
        tooltip: 'Translatium',
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
            preload: process.env.NODE_ENV === 'production'
              ? path.join(__dirname, 'preload-menubar.js')
              : path.join(__dirname, 'preload', 'menubar.js'),
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
        try {
          globalShortcut.register(combinator, () => {
            if (isHidden) {
              mb.showWindow();
              const translateClipboardOnShortcut = getPreference('translateClipboardOnShortcut');
              if (translateClipboardOnShortcut) {
                const text = clipboard.readText();
                if (text.length > 0) {
                  mb.window.send('set-input-text', text);
                  mb.window.send('go-to-home');
                }
              }
            } else {
              mb.hideWindow();
            }
          });
        } catch (err) {
          // Error processing argument at index 0, conversion failure from meta+shift+
          // combinator was not set correctly by the frontend
          // so we have to reset it to default
          if (err && err.message && err.message.includes('processing argument')) {
            resetPreference('openOnMenubarShortcut');
          }
        }
      });

      const openOnMenubarShortcut = getPreference('openOnMenubarShortcut');
      ipcMain.emit('set-show-menubar-shortcut', null, openOnMenubarShortcut);
    } else {
      // Create the browser window.
      const mainWindowState = windowStateKeeper({
        defaultWidth: 500,
        defaultHeight: 600,
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
      electronRemote.enable(mainWindow.webContents);
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

  const showWindow = () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (global.attachToMenubar) {
      if (mb == null) {
        createWindowAsync();
      } else {
        mb.showWindow();
      }
    } else if (mainWindow == null) {
      createWindowAsync();
    } else {
      mainWindow.show();
    }
  };

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
      if (global.attachToMenubar) {
        if (mb && mb.window) {
          showMenu(mb.window, x, y);
        }
      } else if (mainWindow) {
        showMenu(mainWindow, x, y);
      }
    });

    createWindowAsync()
      .then(() => {
        // handle protocols on Windows & Linux
        // on macOS, use 'open-url' event
        if (process.platform !== 'darwin') {
          handleArgv(process.argv);
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
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    app.whenReady()
      .then(() => {
        showWindow();
      });
  });

  app.on('second-instance', (e, argv) => {
    if (global.attachToMenubar) {
      if (mb && mb.window) {
        if (mb.window.isMinimized()) mb.window.restore();
        mb.window.show();
      }
    } else if (mainWindow != null) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
    }

    // handle protocols on Windows & Linux
    // on macOS, use 'open-url' event
    if (process.platform !== 'darwin') {
      handleArgv(argv);
    }
  });

  app.on('open-url', (e, urlStr) => {
    e.preventDefault();

    whenTrulyReady()
      .then(() => {
        handleOpenUrl(urlStr);
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err));
  });

  ipcMain.on('show-window', () => {
    showWindow();
  });
}
