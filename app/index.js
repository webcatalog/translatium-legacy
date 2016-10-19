/* global Windows */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

import store from './store';
import renderRoutes from './renderRoutes';

const runApp = () => {
  /* global document */

  // onTouchTap for material-ui
  injectTapEventPlugin();

  render(
    <Provider store={store}>
      {renderRoutes()}
    </Provider>,
    document.getElementById('app')
  );
};

switch (process.env.PLATFORM) {
  case 'windows': {
    Windows.UI.WebUI.WebUIApplication.onactivated = () => {
      runApp();
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
