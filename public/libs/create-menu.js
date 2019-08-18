
const electron = require('electron');
const { autoUpdater } = require('electron-updater');

const config = require('../config');

const sendToAllWindows = require('./send-to-all-windows');

const {
  Menu,
} = electron;

const createMenu = () => {
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
          click: () => electron.shell.openExternal('https://github.com/translatium/translatium/issues'),
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: config.APP_NAME,
      submenu: [
        { role: 'about', label: `About ${config.APP_NAME}` },
        {
          type: 'separator',
          visible: process.env.SNAP != null,
        },
        {
          label: 'Check for Updates...',
          click: () => {
            global.updateSilent = false;
            autoUpdater.checkForUpdates();
          },
          visible: process.env.SNAP != null,
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: () => sendToAllWindows('go-to-preferences'),
        },
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
  } else {
    // File menu for Windows & Linux
    template.unshift({
      label: 'File',
      submenu: [
        {
          label: 'Preferences...',
          accelerator: 'Ctrl+,',
          click: () => sendToAllWindows('go-to-preferences'),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports = createMenu;
