/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { clipboard } from '@electron/remote';

import { setPreference, updateInputLang, swapLanguages } from '../state/root/preferences/actions';
import { updateInputText, translate, togglePhrasebook } from '../state/pages/home/actions';
import { updateLanguageListMode } from '../state/pages/language-list/actions';
import { } from '../state/pages/phrasebook/actions';
import { changeRoute } from '../state/root/router/actions';
import { open as openDialogAbout } from '../state/root/dialog-about/actions';
import {
  updateShouldUseDarkColors,
  updateIsMaximized,
  updateIsFullScreen,
} from '../state/root/general/actions';
import {
  getShouldUseDarkColors,
} from '../senders';
import { setSystemPreference } from '../state/root/system-preferences/actions';

import {
  ROUTE_HOME,
  ROUTE_HISTORY,
  ROUTE_LANGUAGE_LIST,
  ROUTE_PHRASEBOOK,
  ROUTE_PREFERENCES,
} from '../constants/routes';

const loadListeners = (store) => {
  window.ipcRenderer.on('log', (e, message) => {
    // eslint-disable-next-line
    if (message) console.log(message);
  });

  window.ipcRenderer.on('set-preference', (e, name, value) => store.dispatch(setPreference(name, value)));

  window.ipcRenderer.on('set-input-text', (e, text) => {
    store.dispatch(updateInputText(text, 0, 0));

    const { inputLang, outputLang } = store.getState().preferences;
    store.dispatch(translate(inputLang, outputLang, text));
  });

  window.ipcRenderer.on('set-input-lang', (e, value) => store.dispatch(updateInputLang(value)));

  window.ipcRenderer.on('go-to-preferences', () => store.dispatch(changeRoute(ROUTE_PREFERENCES)));

  window.ipcRenderer.on('go-to-preferences', () => store.dispatch(changeRoute(ROUTE_PREFERENCES)));

  window.ipcRenderer.on('go-to-language-list', (mode) => {
    store.dispatch(updateLanguageListMode(mode));
    store.dispatch(changeRoute(ROUTE_LANGUAGE_LIST));
  });

  window.ipcRenderer.on('go-to-home', () => {
    store.dispatch(changeRoute(ROUTE_HOME));
  });

  window.ipcRenderer.on('go-to-history', () => {
    store.dispatch(changeRoute(ROUTE_HISTORY));
  });

  window.ipcRenderer.on('go-to-phrasebook', () => {
    store.dispatch(changeRoute(ROUTE_PHRASEBOOK));
  });

  window.ipcRenderer.on('swap-languages', () => {
    store.dispatch(swapLanguages());
  });

  window.ipcRenderer.on('clear-input-text', () => {
    store.dispatch(updateInputText(''));
  });

  window.ipcRenderer.on('translate', () => {
    store.dispatch(translate());
  });

  window.ipcRenderer.on('translate-clipboard', () => {
    const { inputLang, outputLang } = store.getState().preferences;
    const inputText = clipboard.readText();
    store.dispatch(updateInputText(inputText));
    store.dispatch(translate(inputLang, outputLang, inputText));
  });

  window.ipcRenderer.on('add-to-phrasebook', () => {
    const { output } = store.getState().pages.home;
    if (!output) return;
    const { phrasebookId } = output;
    if (!phrasebookId) {
      store.dispatch(togglePhrasebook());
    }
  });

  window.ipcRenderer.on('remove-from-phrasebook', () => {
    const { output } = store.getState().pages.home;
    if (!output) return;
    const { phrasebookId } = output;
    if (phrasebookId) {
      store.dispatch(togglePhrasebook());
    }
  });

  window.ipcRenderer.on('open-dialog-about', () => store.dispatch(openDialogAbout()));

  window.ipcRenderer.on('native-theme-updated', () => {
    store.dispatch(updateShouldUseDarkColors(getShouldUseDarkColors()));
  });

  window.ipcRenderer.on('set-system-preference', (e, name, value) => {
    store.dispatch(setSystemPreference(name, value));
  });

  window.ipcRenderer.on('set-is-maximized', (e, isMaximized) => {
    store.dispatch(updateIsMaximized(isMaximized));
  });

  window.ipcRenderer.on('set-is-full-screen', (e, isFullScreen) => {
    store.dispatch(updateIsFullScreen(isFullScreen));
  });
};

export default loadListeners;
