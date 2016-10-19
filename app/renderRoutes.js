import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import store from './store';

import Layout from './views/Layout';

import Home from './views/Home';
import Settings from './views/Settings';
import LanguageList from './views/LanguageList';

const history = syncHistoryWithStore(hashHistory, store);

const renderRoutes = () => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRoute component={Home} />
      <Route path="settings" component={Settings} />
      <Route path="language-list" component={LanguageList} />
    </Route>
  </Router>
);


export default renderRoutes;
