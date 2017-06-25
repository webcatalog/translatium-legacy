/* global Windows */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

import store from './store';
import { updateSetting } from './actions/settings';
import { updateInputText } from './actions/home';
import renderRoutes from './renderRoutes';

import fetchLocal from './libs/fetchLocal';

const runApp = () => {
  /* global document */

  const launchCount = store.getState().settings.launchCount;
  store.dispatch(updateSetting('launchCount', launchCount + 1));

  if (process.env.PLATFORM === 'mac') {
    // Mock user agent
    Object.defineProperty(
      window.navigator,
      'userAgent',
      {
        get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
      },
    );
  }

  fetchLocal('./strings/en-us.json')
    .then(res => res.json())
    .then((strings) => {
      /* global window */
      window.strings = strings;

      // onTouchTap for material-ui
      injectTapEventPlugin();

      render(
        <Provider store={store}>
          {renderRoutes()}
        </Provider>,
        document.getElementById('app'),
      );
    });
};

switch (process.env.PLATFORM) {
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
  case 'mac': {
    runApp();
    break;
  }
  default: {
    /* eslint-disable no-console */
    console.log('Undetected Platfom');
    /* eslint-enable no-console */
  }
}
