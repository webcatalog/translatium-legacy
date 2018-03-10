/* global Windows ipcRenderer */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/createPalette';
import red from 'material-ui/colors/red';
import pink from 'material-ui/colors/pink';

import 'typeface-roboto/index.css';

import './main.css';

import store from './state/reducers';
import { updateInputText } from './state/pages/home/actions';
import { updateStrings } from './state/root/strings/actions';

import renderRoutes from './routes';

import getPlatform from './helpers/get-platform';

import colorPairs from './constants/colors';

export const runApp = (isRestart) => {
  /* global document */
  const state = store.getState();

  if (getPlatform() === 'electron' && !isRestart) {
    // Mock user agent
    Object.defineProperty(
      window.navigator,
      'userAgent',
      {
        get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
      },
    );
  }

  store.dispatch(updateStrings(state.settings.langId));

  const theme = createMuiTheme({
    palette: createPalette({
      type: state.settings.darkMode ? 'dark' : 'light',
      primary: colorPairs[state.settings.primaryColorId],
      secondary: {
        light: pink[300],
        main: pink[500],
        dark: pink[700],
      },
      error: {
        light: red[300],
        main: red[500],
        dark: red[700],
      },
    }),
  });

  render(
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        {renderRoutes(store)}
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app'),
  );
};

switch (getPlatform()) {
  case 'windows': {
    Windows.UI.WebUI.WebUIApplication.onactivated = (args) => {
      if (
        (args.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget)
        && (args.shareOperation.data
          .contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text))
      ) {
        args.shareOperation.data.getTextAsync().done((text) => {
          store.dispatch(updateInputText(text));
          runApp();
        });
      } else {
        runApp();
      }
    };
    break;
  }
  case 'electron': {
    runApp();

    const state = store.getState();
    const openOnMenubarShortcut = state.settings.openOnMenubarShortcut;
    ipcRenderer.send('set-show-menubar-shortcut', openOnMenubarShortcut);

    break;
  }
  default: {
    runApp();
  }
}
