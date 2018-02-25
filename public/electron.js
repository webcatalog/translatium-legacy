/* eslint import/no-unresolved: [2, { ignore: ['electron'] }] */
/* eslint-disable import/no-extraneous-dependencies */

const electron = require('electron');
const menubar = require('menubar');
const path = require('path');
const settings = require('electron-settings');

const isDev = require('electron-is-dev');

const {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  ipcMain,
  Menu,
} = electron;

const config = require('./config');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let menu;

function getMenuTemplate() {
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'toggledevtools' },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: `Learn more about ${config.APP_NAME}`,
          click: () => electron.shell.openExternal(config.APP_URL),
        },
        {
          label: 'Report an Issue...',
          click: () => electron.shell.openExternal('https://github.com/quanglam2807/translatium/issues'),
        },
      ],
    },
  ];

  if (!mainWindow) {
    template[3].submenu.push({
      type: 'separator',
    });
  }

  if (process.platform === 'darwin') {
    template.unshift({
      label: config.APP_NAME,
      submenu: [
        { role: 'about', label: `About ${config.APP_NAME}` },
        { type: 'separator' },
        {
          role: 'hide',
          label: `Hide ${config.APP_NAME}`,
        },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        {
          role: 'quit',
          label: `Quit ${config.APP_NAME}`,
        },
      ],
    });

    // Edit menu
    template[1].submenu.push(
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startspeaking' },
          { role: 'stopspeaking' },
        ],
      },
    );

    // Window menu
    template[3].submenu = [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'close' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  return template;
}

function initMenu() {
  menu = Menu.buildFromTemplate(getMenuTemplate());
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const dockAndMenubar = settings.get('dockAndMenubar', 'showOnBothDockAndMenubar');
  if (dockAndMenubar === 'onlyShowOnMenubar' && !isDev) {
    return;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 320,
    minHeight: 500,
    titleBarStyle: 'hidden',
  });

  // and load the index.html of the app.
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.resolve(__dirname, 'index.html')}`);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    initMenu();
  });

  // mainWindow.webContents.openDevTools();
}

function createMenubar() {
  const dockAndMenubar = settings.get('dockAndMenubar', 'showOnBothDockAndMenubar');
  if (dockAndMenubar === 'onlyShowOnDock') {
    return;
  }

  // Menubar
  const mb = menubar({
    dir: path.resolve(__dirname),
    icon: path.resolve(__dirname, 'images', 'iconTemplate.png'),
    width: 400,
    height: 600,
    showDockIcon: dockAndMenubar === 'showOnBothDockAndMenubar',
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
    globalShortcut.register(combinator, () => {
      if (isHidden) {
        mb.showWindow();

        const translateClipboardOnShortcut = settings.get('translateClipboardOnShortcut', false);
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  createMenubar();
  initMenu();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow == null) {
    createWindow();
  }
});
