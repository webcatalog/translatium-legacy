/* eslint import/no-unresolved: [2, { ignore: ['electron'] }] */
/* eslint-disable import/no-extraneous-dependencies */


const electron = require('electron');

const config = require('../config');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let menu;
let createWindow;

const getMenuTemplate = () => {
  const template = [
    {
      label: config.APP_NAME,
      submenu: [
        {
          role: 'about',
          label: `About ${config.APP_NAME}`,
        },
        {
          type: 'separator',
        },
        {
          role: 'hide',
          label: `Hide ${config.APP_NAME}`,
        },
        {
          role: 'hideothers',
        },
        {
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          role: 'quit',
          label: `Quit ${config.APP_NAME}`,
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo',
        },
        {
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          role: 'cut',
        },
        {
          role: 'copy',
        },
        {
          role: 'paste',
        },
        {
          role: 'delete',
        },
        {
          role: 'selectall',
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: process.platform === 'darwin'
            ? 'Ctrl+Command+F'
            : 'F11',
          click: () => mainWindow.setFullScreen(true),
        },
      ],
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize',
        },
        {
          role: 'zoom',
        },
        {
          type: 'separator',
        },
        {
          role: 'close',
        },
        {
          type: 'separator',
        },
        {
          role: 'front',
        },
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
          click: () => electron.shell.openExternal(`mailto:${config.SUPPORT_EMAIL}`),
        },
      ],
    },
  ];

  if (!mainWindow) {
    template[3].submenu.push({
      type: 'separator',
    });
    template[3].submenu.push({
      label: config.APP_NAME,
      type: 'checkbox',
      click: () => createWindow(),
    });
  }

  return template;
};

const initMenu = () => {
  menu = electron.Menu.buildFromTemplate(getMenuTemplate());
  electron.Menu.setApplicationMenu(menu);
};

createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 320,
    minHeight: 500,
    titleBarStyle: 'hidden',
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${config.ROOT_PATH}/www/index.html`);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    initMenu();
  });

  // mainWindow.webContents.openDevTools();

  // initMenu(mainWindow);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
