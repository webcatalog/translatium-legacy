/* eslint import/no-unresolved: [2, { ignore: ['electron'] }] */
/* eslint-disable import/no-extraneous-dependencies */

const electron = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');

const isDev = require('electron-is-dev');

const { menubar } = require('menubar');

const {
  app,
  BrowserWindow,
  globalShortcut,
  Menu,
  ipcMain,
} = electron;

require('./libs/updater');

const loadListeners = require('./listeners');

const { getPreference } = require('./libs/preferences');
const createMenu = require('./libs/create-menu');

// Register protocol
app.setAsDefaultProtocolClient('translatium');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mb;
let mainWindow;

// Load listeners
loadListeners();

const REACT_PATH = isDev ? 'http://localhost:3000' : `file://${path.resolve(__dirname, 'index.html')}`;

const createWindow = () => {
  const attachToMenubar = getPreference('attachToMenubar');
  if (attachToMenubar) {
    mb = menubar({
      index: REACT_PATH,
      icon: path.resolve(__dirname, 'images', 'menubarTemplate.png'),
      preloadWindow: true,
      browserWindow: {
        webPreferences: {
          nodeIntegration: true,
        },
      },
    });

    const updaterEnabled = process.env.SNAP == null && !process.mas && !process.windowsStore;
    const contextMenu = Menu.buildFromTemplate([
      { role: 'about' },
      {
        type: 'separator',
        visible: updaterEnabled,
      },
      {
        label: 'Check for Updates...',
        click: () => {
          global.updateSilent = false;
          autoUpdater.checkForUpdates();
        },
        visible: updaterEnabled,
      },
      { type: 'separator' },
      {
        label: 'Preferences...',
        click: () => ipcMain.emit('go-to-preferences'),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          mb.app.quit();
        },
      },
    ]);

    mb.on('ready', () => {
      mb.tray.on('right-click', () => {
        mb.tray.popUpContextMenu(contextMenu);
      });
    });

    ipcMain.on('unset-show-menubar-shortcut', (e, combinator) => {
      globalShortcut.unregister(combinator);
    });

    let isHidden = true;

    mb.on('show', () => {
      isHidden = false;
    });

    mb.on('hide', () => {
      isHidden = true;
    });

    ipcMain.on('set-show-menubar-shortcut', (e, combinator) => {
      console.log(e, combinator);
      globalShortcut.register(combinator, () => {
        if (isHidden) {
          mb.showWindow();
          /*
          const translateClipboardOnShortcut = getPreference('translateClipboardOnShortcut');
          if (translateClipboardOnShortcut) {
            const text = clipboard.readText();
            if (text.length > 0) {
              mb.window.send('set-input-text', text);
            }
          }
          */
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
      minWidth: 320,
      minHeight: 500,
      titleBarStyle: 'hidden',
      autoHideMenuBar: true,
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
  createWindow();
  createMenu();
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
