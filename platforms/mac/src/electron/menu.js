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
          label: 'Full Screen',
          type: 'checkbox',
          accelerator: process.platform === 'darwin'
            ? 'Ctrl+Command+F'
            : 'F11',
          click: () => mainWindow.setFullScreen(true),
        },
        {
          type: 'separator',
        },
        {
          label: 'Developer',
          submenu: [
            {
              label: 'Developer Tools',
              accelerator: process.platform === 'darwin'
                ? 'Alt+Command+I'
                : 'Ctrl+Shift+I',
              click: () => mainWindow.toggleDevTools(),
            },
          ],
        },
      ],
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: `Learn more about ${config.APP_NAME}`,
          click: () => electron.shell.openExternal(config.HOME_PAGE_URL),
        },
        {
          label: 'Report an Issue...',
          click: () => electron.shell.openExternal(config.SUPPORT_EMAIL),
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    // Add WebTorrent app menu (OS X)
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
          type: 'separator',
        },
        {
          label: 'Services',
          role: 'services',
          submenu: [],
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

  // On Windows and Linux, open dialogs do not support selecting both files and
  // folders and files, so add an extra menu item so there is one for each type.
  if (process.platform === 'linux' || process.platform === 'win32') {
    // Help menu (Windows, Linux)
    template[4].submenu.push(
      {
        label: `About ${config.APP_NAME}`,
        click: () => { /* windows.about.init() */ },
      }
    );
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
