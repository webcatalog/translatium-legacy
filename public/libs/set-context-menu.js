/* eslint-disable no-param-reassign */

// https://github.com/sindresorhus/electron-context-menu/blob/296ae9cbaf8f29e5e1e5f4c7d233e74a605c5507/index.js
// Modified to support localization
// remote & image support is removed

const {
  app,
  clipboard,
  Menu,
  BrowserWindow,
} = require('electron');
const cliTruncate = require('cli-truncate');
const { getLocale } = require('./locales');

const decorateMenuItem = (menuItem) => (options = {}) => {
  if (options.transform && !options.click) {
    menuItem.transform = options.transform;
  }

  return menuItem;
};

const removeUnusedMenuItems = (menuTemplate) => {
  let notDeletedPreviousElement;

  return menuTemplate
    .filter(
      (menuItem) => menuItem !== undefined && menuItem !== false && menuItem.visible !== false,
    )
    .filter((menuItem, index, array) => {
      const toDelete = menuItem.type === 'separator' && (!notDeletedPreviousElement || index === array.length - 1 || array[index + 1].type === 'separator');
      notDeletedPreviousElement = toDelete ? notDeletedPreviousElement : menuItem;
      return !toDelete;
    });
};

const create = (win, options) => {
  win.webContents.on('context-menu', (event, props) => {
    if (typeof options.shouldShowMenu === 'function' && options.shouldShowMenu(event, props) === false) {
      return;
    }

    const { editFlags } = props;
    const hasText = props.selectionText.trim().length > 0;
    const isLink = Boolean(props.linkURL);
    const can = (type) => editFlags[`can${type}`] && hasText;

    const defaultActions = {
      separator: () => ({ type: 'separator' }),
      lookUpSelection: decorateMenuItem({
        id: 'lookUpSelection',
        label: getLocale('lookUp'),
        visible: process.platform === 'darwin' && hasText && !isLink,
        click() {
          if (process.platform === 'darwin') {
            win.webContents.showDefinitionForSelection();
          }
        },
      }),
      cut: decorateMenuItem({
        id: 'cut',
        label: getLocale('cut'),
        enabled: can('Cut'),
        visible: props.isEditable,
        click(menuItem) {
          const target = win.webContents;

          if (!menuItem.transform && target) {
            target.cut();
          } else {
            props.selectionText = menuItem.transform
              ? menuItem.transform(props.selectionText) : props.selectionText;
            clipboard.writeText(props.selectionText);
          }
        },
      }),
      copy: decorateMenuItem({
        id: 'copy',
        label: getLocale('copy'),
        enabled: can('Copy'),
        visible: props.isEditable || hasText,
        click(menuItem) {
          const target = win.webContents;

          if (!menuItem.transform && target) {
            target.copy();
          } else {
            props.selectionText = menuItem.transform
              ? menuItem.transform(props.selectionText) : props.selectionText;
            clipboard.writeText(props.selectionText);
          }
        },
      }),
      paste: decorateMenuItem({
        id: 'paste',
        label: getLocale('paste'),
        enabled: editFlags.canPaste,
        visible: props.isEditable,
        click(menuItem) {
          const target = win.webContents;

          if (menuItem.transform) {
            let clipboardContent = clipboard.readText(props.selectionText);
            clipboardContent = menuItem.transform
              ? menuItem.transform(clipboardContent) : clipboardContent;
            target.insertText(clipboardContent);
          } else {
            target.paste();
          }
        },
      }),
      copyLink: decorateMenuItem({
        id: 'copyLink',
        label: getLocale('copyLink'),
        visible: props.linkURL.length !== 0 && props.mediaType === 'none',
        click(menuItem) {
          props.linkURL = menuItem.transform ? menuItem.transform(props.linkURL) : props.linkURL;

          clipboard.write({
            bookmark: props.linkText,
            text: props.linkURL,
          });
        },
      }),
      inspect: () => ({
        id: 'inspect',
        label: 'Inspect Element',
        click() {
          win.inspectElement(props.x, props.y);

          if (win.webContents.isDevToolsOpened()) {
            win.webContents.devToolsWebContents.focus();
          }
        },
      }),
    };

    const shouldShowInspectElement = typeof options.showInspectElement === 'boolean' ? options.showInspectElement : !app.isPackaged;

    let menuTemplate = [
      defaultActions.separator(),
      options.showLookUpSelection !== false && defaultActions.lookUpSelection(),
      defaultActions.separator(),
      defaultActions.cut(),
      defaultActions.copy(),
      defaultActions.paste(),
      defaultActions.separator(),
      defaultActions.copyLink(),
      defaultActions.separator(),
      shouldShowInspectElement && defaultActions.inspect(),
      defaultActions.separator(),
    ];

    if (options.menu) {
      menuTemplate = options.menu(defaultActions, props, win);
    }

    if (options.prepend) {
      const result = options.prepend(defaultActions, props, win);

      if (Array.isArray(result)) {
        menuTemplate.unshift(...result);
      }
    }

    if (options.append) {
      const result = options.append(defaultActions, props, win);

      if (Array.isArray(result)) {
        menuTemplate.push(...result);
      }
    }

    // Filter out leading/trailing separators
    // TODO: https://github.com/electron/electron/issues/5869
    menuTemplate = removeUnusedMenuItems(menuTemplate);

    /* eslint-disable no-restricted-syntax */
    for (const menuItem of menuTemplate) {
      // Apply custom labels for default menu items
      if (options.labels && options.labels[menuItem.id]) {
        menuItem.label = options.labels[menuItem.id];
      }

      // Replace placeholders in menu item labels
      if (typeof menuItem.label === 'string' && menuItem.label.includes('{selection}')) {
        const selectionString = typeof props.selectionText === 'string' ? props.selectionText.trim() : '';
        menuItem.label = menuItem.label.replace('{selection}', cliTruncate(selectionString, 25));
      }
    }
    /* eslint-enable no-restricted-syntax */

    if (menuTemplate.length > 0) {
      const menu = Menu.buildFromTemplate(menuTemplate);

      /*
      When `remote` is not available, this runs in the browser process.

      We can safely use `win` in this case as it refers to the window the
      context-menu should open in.

      When this is being called from a web view, we can't use `win` as this
      would refer to the web view which is not allowed to render a popup menu.
      */
      menu.popup(win);
    }
  });
};

module.exports = (options = {}) => {
  if (options.window) {
    const win = options.window;

    // When window is a webview that has not yet finished loading webContents is not available
    if (win.webContents === undefined) {
      win.addEventListener('dom-ready', () => {
        create(win, options);
      }, { once: true });
      return;
    }

    // eslint-disable-next-line consistent-return
    return create(win, options);
  }

  /* eslint-disable no-restricted-syntax */
  for (const win of BrowserWindow.getAllWindows()) {
    create(win, options);
  }
  /* eslint-enable no-restricted-syntax */

  app.on('browser-window-created', (event, win) => {
    create(win, options);
  });
};
