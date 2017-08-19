import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import store from './store';

import App from './components/app';

import Home from './components/home';
import Phrasebook from './components/phrasebook';
import Settings from './components/settings';
import LanguageList from './components/language-list';
import Ocr from './components/ocr';
import BiggerText from './components/bigger-text';

const history = syncHistoryWithStore(hashHistory, store);

const renderRoutes = () => (
  <Router history={history}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="phrasebook" component={Phrasebook} />
      <Route path="settings" component={Settings} />
      <Route path="language-list" component={LanguageList} />
      <Route path="ocr" component={Ocr} />
      <Route path="bigger-text" component={BiggerText} />
    </Route>
  </Router>
);


export default renderRoutes;
