import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import store from './store';

import Layout from './views/Layout';

const history = syncHistoryWithStore(hashHistory, store);

const loadRoute = cb => module => cb(null, module.default);

const errorLoading = (err) => {
  /* eslint-disable no-console */
  console.error('Dynamic page loading failed', err);
  /* eslint-enable no-console */
};

const renderRoutes = () => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRoute
        getComponent={(location, cb) => {
          System.import('./views/Home').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="phrasebook"
        getComponent={(location, cb) => {
          System.import('./views/Phrasebook').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="settings"
        getComponent={(location, cb) => {
          System.import('./views/Settings').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="help"
        getComponent={(location, cb) => {
          System.import('./views/Help').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="language-list"
        getComponent={(location, cb) => {
          System.import('./views/LanguageList').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="ocr"
        getComponent={(location, cb) => {
          System.import('./views/Ocr').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="bigger-text"
        getComponent={(location, cb) => {
          System.import('./views/BiggerText').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
    </Route>
  </Router>
);


export default renderRoutes;
