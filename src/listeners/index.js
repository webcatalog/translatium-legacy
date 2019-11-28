import { setPreference, updateInputLang } from '../state/root/preferences/actions';
import { updateInputText } from '../state/pages/home/actions';
import { changeRoute } from '../state/root/router/actions';

import { ROUTE_PREFERENCES } from '../constants/routes';

const { ipcRenderer } = window.require('electron');

const loadListeners = (store) => {
  ipcRenderer.on('log', (e, message) => {
    // eslint-disable-next-line
    if (message) console.log(message);
  });

  ipcRenderer.on('set-preference', (e, name, value) => {
    store.dispatch(setPreference(name, value));
  });

  ipcRenderer.on('set-input-text', (e, text) => {
    store.dispatch(updateInputText(text, 0, 0));
  });

  ipcRenderer.on('set-input-lang', (e, value) => {
    store.dispatch(updateInputLang(value));
  });

  ipcRenderer.on('go-to-preferences', () => store.dispatch(changeRoute(ROUTE_PREFERENCES)));
};

export default loadListeners;
