/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

let menu;

const electron = require('electron');

const app = electron.app;

const config = require('../config');

function getMenuTemplate(mainWindow) {
  const template = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
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
      label: 'Help',
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

  if (process.platform === 'darwin') {
    template.unshift({
      label: config.APP_NAME,
      submenu: [
        {
          label: `About ${config.APP_NAME}`,
          role: 'about',
        },
        {
          type: 'separator',
        },
        {
          label: `Hide ${config.APP_NAME}`,
          accelerator: 'Command+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit(),
        },
      ],
    });

    // Add Window menu (OS X)
    template.splice(5, 0, {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize',
        },
        {
          type: 'separator',
        },
        {
          label: 'Bring All to Front',
          role: 'front',
        },
      ],
    });
  }

  // Add "File > Quit" menu item so Linux distros where the system tray icon is
  // missing will have a way to quit the app.
  if (process.platform === 'linux') {
    // File menu (Linux)
    template[0].submenu.push({
      label: 'Quit',
      click: () => app.quit(),
    });
  }

  return template;
}

function init(mainWindow) {
  menu = electron.Menu.buildFromTemplate(getMenuTemplate(mainWindow));
  electron.Menu.setApplicationMenu(menu);
}

module.exports = {
  init,
};
