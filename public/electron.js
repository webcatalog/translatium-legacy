/* eslint import/no-unresolved: [2, { ignore: ['electron'] }] */
/* eslint-disable import/no-extraneous-dependencies */

const {
  BrowserWindow,
  Menu,
  app,
  clipboard,
  dialog,
  globalShortcut,
  ipcMain,
  nativeTheme,
  shell,
} = require('electron');
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

require('./libs/updater');

// see https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mb;
let mainWindow;

const gotTheLock = app.requestSingleInstanceLock();

app.on('second-instance', () => {
  if (mainWindow != null) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (!gotTheLock) {
  app.quit();
} else {
  // Register protocol
  app.setAsDefaultProtocolClient('translatium');

  // Load listeners
  loadListeners();

  const REACT_PATH = isDev ? 'http://localhost:3000' : `file://${path.resolve(__dirname, 'index.html')}`;

  const createWindow = () => {
    const updaterEnabled = process.env.SNAP == null && !process.mas && !process.platform === 'win32';
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
                // https://github.com/atomery/webcatalog/issues/634
                if (process.platform === 'linux' && process.env.DESKTOPINTEGRATION === 'AppImageLauncher') {
                  dialog.showMessageBox(mainWindow, {
                    type: 'error',
                    message: getLocale('appImageLauncherDesc'),
                    buttons: [getLocale('ok'), getLocale('learnMore2')],
                    cancelId: 0,
                    defaultId: 0,
                  })
                    .then(({ response }) => {
                      if (response === 1) {
                        shell.openExternal('https://github.com/atomery/webcatalog/issues/634');
                      }
                    })
                    .catch(console.log); // eslint-disable-line
                  return;
                }

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
        // manually set dock icon for AppImage
        // Snap icon is set correct already so no need to intervene
        icon: process.platform === 'linux' && process.env.SNAP == null ? path.resolve(__dirname, 'images', 'icon-linux.png') : undefined,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
        },
      });

      // and load the index.html of the app.
      mainWindow.loadURL(REACT_PATH);

      // Emitted when the window is closed.
      mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        createMenu();
      });
    }
  };

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    const themeSource = getPreference('themeSource');
    nativeTheme.themeSource = themeSource;

    createWindow();
    createMenu();
    setContextMenu();

    nativeTheme.addListener('updated', () => {
      sendToAllWindows('native-theme-updated');
    });

    if (autoUpdater.isUpdaterActive()) {
      // https://github.com/atomery/webcatalog/issues/634
      if (process.platform === 'linux' && process.env.DESKTOPINTEGRATION === 'AppImageLauncher') {
        dialog.showMessageBox(mainWindow, {
          type: 'error',
          message: getLocale('appImageLauncherDesc'),
          buttons: [getLocale('ok'), getLocale('learnMore2')],
          cancelId: 0,
          defaultId: 0,
        })
          .then(({ response }) => {
            if (response === 1) {
              shell.openExternal('https://github.com/atomery/webcatalog/issues/634');
            }
          })
          .catch(console.log); // eslint-disable-line
      } else {
        autoUpdater.checkForUpdates();
      }
    }
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    const attachToMenubar = getPreference('attachToMenubar');

    if (attachToMenubar) {
      if (mb == null) {
        createWindow();
      } else {
        mb.on('ready', () => {
          mb.showWindow();
        });
      }
    } else if (mainWindow == null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });

  app.on('open-url', (e, urlStr) => {
    e.preventDefault();

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
}
