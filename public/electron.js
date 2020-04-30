/* eslint import/no-unresolved: [2, { ignore: ['electron'] }] */
/* eslint-disable import/no-extraneous-dependencies */

const {
  BrowserWindow,
  Menu,
  app,
  clipboard,
  globalShortcut,
  ipcMain,
  nativeTheme,
} = require('electron');
const fs = require('fs');
const settings = require('electron-settings');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
const { menubar } = require('menubar');

const createMenu = require('./libs/create-menu');
const loadListeners = require('./listeners');
const { getPreference } = require('./libs/preferences');
const { getLocale } = require('./libs/locales');
const sendToAllWindows = require('./libs/send-to-all-windows');
const setContextMenu = require('./libs/set-context-menu');
const prepareUpdaterForAppImage = require('./libs/prepare-updater-for-appimage');

require('./libs/updater');

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
  if (fs.existsSync(settings.file())) {
    const useHardwareAcceleration = getPreference('useHardwareAcceleration');
    if (!useHardwareAcceleration) {
      app.disableHardwareAcceleration();
    }
  }

  // mock app.whenReady
  const fullyReady = false;
  const whenFullyReady = () => {
    if (fullyReady) return Promise.resolve();
    return new Promise((resolve) => {
      ipcMain.once('fully-ready', () => resolve());
    });
  };

  // Register protocol
  app.setAsDefaultProtocolClient('translatium');

  // Load listeners
  loadListeners();

  const REACT_PATH = isDev ? 'http://localhost:3000' : `file://${path.resolve(__dirname, 'index.html')}`;

  const createWindowAsync = () => new Promise((resolve) => {
    const updaterEnabled = process.env.SNAP == null && !process.mas && process.platform !== 'win32';
    const attachToMenubar = getPreference('attachToMenubar');
    if (attachToMenubar) {
      mb = menubar({
        index: REACT_PATH,
        icon: path.resolve(__dirname, 'images', 'menubarTemplate.png'),
        preloadWindow: true,
        browserWindow: {
          alwaysOnTop: getPreference('alwaysOnTop'),
          width: 400,
          height: 500,
          minWidth: 400,
          minHeight: 500,
          webPreferences: {
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
                prepareUpdaterForAppImage(autoUpdater);
                global.updateSilent = false;
                autoUpdater.checkForUpdates();
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
              label: getLocale('Quit'),
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
      mainWindow = new BrowserWindow({
        width: 500,
        height: 600,
        minWidth: 400,
        minHeight: 500,
        titleBarStyle: 'hidden',
        autoHideMenuBar: false,
        show: false,
        // manually set dock icon for AppImage
        // Snap icon is set correct already so no need to intervene
        icon: process.platform === 'linux' && process.env.SNAP == null ? path.resolve(__dirname, 'images', 'icon-linux.png') : undefined,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
        },
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
    // trigger whenFullyReady
    ipcMain.emit('fully-ready');
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    const themeSource = getPreference('themeSource');
    nativeTheme.themeSource = themeSource;

    createWindowAsync();
    createMenu();
    setContextMenu();

    nativeTheme.addListener('updated', () => {
      sendToAllWindows('native-theme-updated');
    });

    if (autoUpdater.isUpdaterActive()) {
      prepareUpdaterForAppImage(autoUpdater);
      autoUpdater.checkForUpdates();
    }
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

    whenFullyReady()
      .then(() => {
        if (urlStr.startsWith('translatium://')) {
          const urlObj = url.parse(urlStr, true);
          const text = decodeURIComponent(urlObj.query.text || '');

          const attachToMenubar = getPreference('attachToMenubar');
          if (attachToMenubar) {
            if (mb && mb.window) {
              mb.window.send('set-input-lang', 'auto');
              mb.window.send('set-input-text', text);
            }
          } else if (mainWindow) {
            mainWindow.send('set-input-lang', 'auto');
            mainWindow.send('set-input-text', text);
          }
        }
      });
  });
}
