import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import store from './store';

import Layout from './views/Layout';

import Home from './views/Home';
import Settings from './views/Settings';
import About from './views/About';

const history = syncHistoryWithStore(hashHistory, store);

const renderRoutes = () => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRoute component={Home} />
      <Route path="settings" component={Settings} />
      <Route path="about" component={About} />
    </Route>
  </Router>
);


export default renderRoutes;
