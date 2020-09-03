const {
  BrowserWindow,
  Menu,
  app,
  shell,
  dialog,
} = require('electron');
const { autoUpdater } = require('electron-updater');

const config = require('../config');

const sendToAllWindows = require('./send-to-all-windows');
const { getLocale } = require('./locales');
const { getPreference } = require('./preferences');

const createMenu = () => {
  const updaterEnabled = process.env.SNAP == null && !process.mas && !process.windowsStore;
  const handleCheckForUpdates = () => {
    // restart & apply updates
    if (global.updaterObj && global.updaterObj.status === 'update-downloaded') {
      setImmediate(() => {
        app.removeAllListeners('window-all-closed');
        const win = BrowserWindow.getFocusedWindow();
        if (win != null) {
          win.close();
        }
        autoUpdater.quitAndInstall(false);
      });
    }

    global.updateSilent = false;
    autoUpdater.checkForUpdates();
  };

  const updaterMenuItem = {
    label: getLocale('checkForUpdates'),
    click: handleCheckForUpdates,
    visible: updaterEnabled,
  };
  if (global.updaterObj && global.updaterObj.status === 'update-downloaded') {
    updaterMenuItem.label = getLocale('restartToApplyUpdates');
  } else if (global.updaterObj && global.updaterObj.status === 'update-available') {
    updaterMenuItem.enabled = false;
  } else if (global.updaterObj && global.updaterObj.status === 'checking-for-update') {
    updaterMenuItem.enabled = false;
  }

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
        { type: 'separator' },
        {
          label: getLocale('find'),
          accelerator: 'CmdOrCtrl+F',
          click: () => sendToAllWindows('open-find'),
        },
        { type: 'separator' },
        {
          label: getLocale('selectInputLang'),
          accelerator: 'CmdOrCtrl+1',
          click: () => sendToAllWindows('go-to-language-list', 'inputLang'),
        },
        {
          label: getLocale('selectOutputLang'),
          accelerator: 'CmdOrCtrl+2',
          click: () => sendToAllWindows('go-to-language-list', 'outputLang'),
        },
        {
          label: getLocale('swapLanguages'),
          accelerator: 'CmdOrCtrl+3',
          click: () => sendToAllWindows('swap-languages'),
        },
        {
          label: getLocale('clearInputText'),
          accelerator: 'CmdOrCtrl+Delete',
          click: () => sendToAllWindows('clear-input-text'),
        },
        {
          label: getLocale('translate'),
          accelerator: 'CmdOrCtrl+T',
          click: () => sendToAllWindows('translate'),
        },
        {
          label: getLocale('translateClipboard'),
          accelerator: 'CmdOrCtrl+Shift+V',
          click: () => sendToAllWindows('translate-clipboard'),
        },
        {
          label: getLocale('addToPhrasebook'),
          accelerator: 'CmdOrCtrl+S',
          click: () => sendToAllWindows('add-to-phrasebook'),
        },
        {
          label: getLocale('removeFromPhrasebook'),
          accelerator: 'CmdOrCtrl+R',
          click: () => sendToAllWindows('remove-from-phrasebook'),
        },
      ],
    },
    {
      role: 'view',
      label: getLocale('view'),
      submenu: [
        {
          label: getLocale('home'),
          accelerator: 'CmdOrCtrl+Shift+H',
          click: () => sendToAllWindows('go-to-home'),
        },
        {
          label: getLocale('history'),
          accelerator: 'CmdOrCtrl+Y',
          click: () => sendToAllWindows('go-to-history'),
        },
        {
          label: getLocale('phrasebook'),
          accelerator: 'CmdOrCtrl+Shift+B',
          click: () => sendToAllWindows('go-to-phrasebook'),
        },
        { type: 'separator' },
        { role: 'togglefullscreen', label: getLocale('toggleFullscreen') },
      ],
    },
    {
      role: 'window',
      label: getLocale('window'),
      submenu: [
        { role: 'minimize', label: getLocale('minimize') },
        { type: 'separator' },
        { role: 'close', label: getLocale('close') },
      ],
    },
    {
      role: 'help',
      label: getLocale('help'),
      submenu: [
        {
          label: getLocale('appNameSupport'),
          click: () => shell.openExternal('https://atomery.com/support?app=translatium'),
        },
        {
          label: getLocale('reportAnIssueViaGitHub'),
          click: () => shell.openExternal('https://github.com/translatium/translatium/issues'),
        },
        {
          label: getLocale('learnMoreAbout'),
          click: () => shell.openExternal(config.APP_URL),
        },
      ],
    },
  ];

  const registered = getPreference('registered');
  if (process.platform === 'darwin') {
    template.unshift({
      label: config.APP_NAME,
      submenu: [
        {
          label: getLocale('aboutApp').replace('{appName}', app.name),
          click: () => sendToAllWindows('open-dialog-about'),
        },
        {
          type: 'separator',
          visible: updaterEnabled,
        },
        updaterMenuItem,
        {
          type: 'separator',
          visible: !process.mas,
        },
        {
          label: registered ? getLocale('registered') : getLocale('registration'),
          enabled: !registered,
          click: registered ? null : () => sendToAllWindows('open-license-registration-dialog'),
          visible: !process.mas,
        },
        { type: 'separator' },
        {
          label: getLocale('preferencesMenuItem'),
          accelerator: 'CmdOrCtrl+,',
          click: () => sendToAllWindows('go-to-preferences'),
        },
        { type: 'separator' },
        { role: 'hide', label: getLocale('hide') },
        { role: 'hideothers', label: getLocale('hideOthers') },
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
    const submenu = [
      {
        label: getLocale('about'),
        click: () => sendToAllWindows('open-dialog-about'),
      },
      {
        type: 'separator',
        visible: !process.windowsStore,
      },
      {
        label: registered ? getLocale('registered') : getLocale('registration'),
        enabled: !registered,
        click: registered ? null : () => sendToAllWindows('open-license-registration-dialog'),
        visible: !process.windowsStore,
      },
      {
        type: 'separator',
      },
      {
        label: getLocale('preferencesMenuItem'),
        accelerator: 'CmdOrCtrl+,',
        click: () => sendToAllWindows('go-to-preferences'),
      },
      { type: 'separator' },
      { role: 'quit', label: getLocale('quit') },
    ];
    if (updaterEnabled) {
      submenu.splice(1, 0, {
        type: 'separator',
      });
      submenu.splice(2, 0, updaterMenuItem);
      submenu.splice(3, 0, {
        type: 'separator',
      });
    }
    template.unshift({
      label: getLocale('file'),
      submenu,
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports = createMenu;
