/* global WinJS Windows */

import 'whatwg-fetch';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store from './store';
import renderRoutes from './renderRoutes';

WinJS.Application.onactivated = () => {
  render(
    <Provider store={store}>
      {renderRoutes()}
    </Provider>,
    document.getElementById('app')
  );
};

WinJS.Application.start();
