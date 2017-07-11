/* global Windows */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import initReactFastclick from 'react-fastclick';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/palette';
import red from 'material-ui/colors/red';
import pink from 'material-ui/colors/pink';

import './main.css';
import './fonts/roboto.css';

import store from './store';
import { updateSetting } from './actions/settings';
import { updateInputText } from './actions/home';
import { updateStrings } from './actions/strings';

import renderRoutes from './renderRoutes';

import getPlatform from './libs/getPlatform';

import colorPairs from './constants/colorPairs';

export const runApp = (isRestart) => {
  /* global document */
  const state = store.getState();
  const launchCount = state.settings.launchCount;
  store.dispatch(updateSetting('launchCount', launchCount + 1));


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

  if (getPlatform() === 'cordova') {
    // https://github.com/ftlabs/fastclick/issues/450
    // Fix 300ms delay
    initReactFastclick();
  }

  const theme = createMuiTheme({
    palette: createPalette({
      type: state.settings.darkMode ? 'dark' : 'light',
      primary: colorPairs[state.settings.primaryColorId],
      accent: pink,
      error: red,
    }),
  });

  render(
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        {renderRoutes()}
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
        && (args.shareOperation.data.contains(
          Windows.ApplicationModel.DataTransfer.StandardDataFormats.text,
        ))
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
    break;
  }
  case 'cordova': {
    document.addEventListener('deviceready', runApp, false);
    break;
  }
  default: {
    runApp();
  }
}
