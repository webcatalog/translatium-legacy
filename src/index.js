/* global document */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import 'typeface-roboto/index.css';

import './main.css';

import store from './state/reducers';

import AppWrapper from './components/app-wrapper';

const { webFrame } = window.require('electron');

webFrame.setVisualZoomLevelLimits(1, 1);

// https://github.com/quanglam2807/translatium/issues/28
// remove text formatting when copying
document.addEventListener('copy', (e) => {
  const textOnly = document.getSelection().toString();
  const clipdata = e.clipboardData || window.clipboardData;
  clipdata.setData('text/plain', textOnly);
  clipdata.setData('text/html', textOnly);
  e.preventDefault();
});

render(
  <Provider store={store}>
    <AppWrapper />
  </Provider>,
  document.getElementById('app'),
);

window.speechSynthesis.onvoiceschanged = () => {
  render(
    <Provider store={store}>
      <AppWrapper />
    </Provider>,
    document.getElementById('app'),
  );
};
