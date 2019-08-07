/* global document */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import 'typeface-roboto/index.css';

import './main.css';

import store from './state/reducers';

import renderRoutes from './routes';

const { webFrame } = window.require('electron');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

render(
  <Provider store={store}>
    {renderRoutes(store)}
  </Provider>,
  document.getElementById('app'),
);

window.speechSynthesis.onvoiceschanged = () => {
  render(
    <Provider store={store}>
      {renderRoutes(store)}
    </Provider>,
    document.getElementById('app'),
  );
};
