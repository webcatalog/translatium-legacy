import { setPreference, updateInputLang, swapLanguages } from '../state/root/preferences/actions';
import {
  insertInputText, updateInputText, translate, togglePhrasebook,
} from '../state/pages/home/actions';
import { updateLanguageListMode } from '../state/pages/language-list/actions';
import { } from '../state/pages/phrasebook/actions';
import { changeRoute } from '../state/root/router/actions';
import { open as openDialogAbout } from '../state/root/dialog-about/actions';

import { ROUTE_PREFERENCES, ROUTE_LANGUAGE_LIST } from '../constants/routes';

const { ipcRenderer, remote } = window.require('electron');

const loadListeners = (store) => {
  ipcRenderer.on('log', (e, message) => {
    // eslint-disable-next-line
    if (message) console.log(message);
  });

  ipcRenderer.on('set-preference', (e, name, value) => store.dispatch(setPreference(name, value)));

  ipcRenderer.on('set-input-text', (e, text) => store.dispatch(updateInputText(text, 0, 0)));

  ipcRenderer.on('set-input-lang', (e, value) => store.dispatch(updateInputLang(value)));

  ipcRenderer.on('go-to-preferences', () => store.dispatch(changeRoute(ROUTE_PREFERENCES)));

  ipcRenderer.on('go-to-preferences', () => store.dispatch(changeRoute(ROUTE_PREFERENCES)));

  ipcRenderer.on('go-to-language-list', (mode) => {
    store.dispatch(updateLanguageListMode(mode));
    store.dispatch(changeRoute(ROUTE_LANGUAGE_LIST));
  });

  ipcRenderer.on('swap-languages', () => {
    store.dispatch(swapLanguages());
  });

  ipcRenderer.on('clear-input-text', () => {
    store.dispatch(updateInputText(''));
  });

  ipcRenderer.on('translate', () => {
    store.dispatch(translate());
  });

  ipcRenderer.on('translate-clipboard', () => {
    const text = remote.clipboard.readText();
    store.dispatch(insertInputText(text));
    store.dispatch(translate());
  });

  ipcRenderer.on('add-to-phrasebook', () => {
    const { output } = store.getState().pages.home;
    if (!output) return;
    const { phrasebookId } = output;
    if (!phrasebookId) {
      store.dispatch(togglePhrasebook());
    }
  });

  ipcRenderer.on('remove-from-phrasebook', () => {
    const { output } = store.getState().pages.home;
    if (!output) return;
    const { phrasebookId } = output;
    if (phrasebookId) {
      store.dispatch(togglePhrasebook());
    }
  });

  ipcRenderer.on('open-dialog-about', () => store.dispatch(openDialogAbout()));
};

export default loadListeners;
