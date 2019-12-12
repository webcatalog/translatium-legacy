
const electron = require('electron');
const { autoUpdater } = require('electron-updater');

const config = require('../config');

const sendToAllWindows = require('./send-to-all-windows');
const { getLocale } = require('./locales');

const {
  Menu,
} = electron;

const createMenu = () => {
  const updaterEnabled = process.env.SNAP == null && !process.mas && !process.windowsStore;

  const template = [
    {
      role: 'edit',
      label: getLocale('edit'),
      submenu: [
        { role: 'undo', label: getLocale('undo') },
        { role: 'redo', label: getLocale('redo') },
        { type: 'separator' },
        { role: 'cut', label: getLocale('cut') },
        { role: 'copy', label: getLocale('copy') },
        { role: 'paste', label: getLocale('paste') },
        { role: 'delete', label: getLocale('delete') },
        { role: 'selectall', label: getLocale('selectAll') },
      ],
    },
    {
      role: 'view',
      label: getLocale('view'),
      submenu: [
        { role: 'togglefullscreen', label: getLocale('toggleFullscreen') },
        { type: 'separator' },
        { role: 'toggledevtools', label: getLocale('toggleDevTools') },
      ],
    },
    {
      role: 'window',
      label: getLocale('window'),
      submenu: [
        { role: 'minimize', label: getLocale('minimize') },
        { role: 'close', label: getLocale('close') },
      ],
    },
    {
      role: 'help',
      label: getLocale('help'),
      submenu: [
        {
          label: getLocale('learnMore'),
          click: () => electron.shell.openExternal(config.APP_URL),
        },
        {
          label: getLocale('reportAnIssue'),
          click: () => electron.shell.openExternal('https://github.com/translatium/translatium/issues'),
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: config.APP_NAME,
      submenu: [
        {
          label: getLocale('about'),
          click: () => sendToAllWindows('open-dialog-about'),
        },
        {
          type: 'separator',
          visible: updaterEnabled,
        },
        {
          label: getLocale('checkForUpdates'),
          click: () => {
            global.updateSilent = false;
            autoUpdater.checkForUpdates();
          },
          visible: updaterEnabled,
        },
        { type: 'separator' },
        {
          label: getLocale('preferencesMenuItem'),
          accelerator: 'Cmd+,',
          click: () => sendToAllWindows('go-to-preferences'),
        },
        { type: 'separator' },
        { role: 'hide', label: getLocale('hide') },
        { role: 'hideothers', label: getLocale('hideOthers') },
        { role: 'unhide', label: getLocale('unhide') },
        { type: 'separator' },
        { role: 'quit', label: getLocale('quit') },
      ],
    });

    // Window menu
    template[3].submenu = [
      { role: 'minimize', label: getLocale('minimize') },
      { role: 'zoom', label: getLocale('zoom') },
      { type: 'separator' },
      { role: 'close', label: getLocale('close') },
      { type: 'separator' },
      { role: 'front', label: getLocale('bringAllToFront') },
    ];
  } else {
    // File menu for Windows & Linux
    template.unshift({
      label: getLocale('file'),
      submenu: [
        {
          label: getLocale('about'),
          click: () => sendToAllWindows('open-dialog-about'),
        },
        {
          type: 'separator',
          visible: updaterEnabled,
        },
        {
          label: getLocale('checkForUpdates'),
          click: () => {
            global.updateSilent = false;
            autoUpdater.checkForUpdates();
          },
          visible: updaterEnabled,
        },
        {
          type: 'separator',
        },
        {
          label: getLocale('preferencesMenuItem'),
          accelerator: 'Ctrl+,',
          click: () => sendToAllWindows('go-to-preferences'),
        },
        { type: 'separator' },
        { role: 'quit', label: getLocale('quit') },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports = createMenu;
