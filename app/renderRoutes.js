import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import store from './store';

import Layout from './views/Layout';

import Home from './views/Home';
import Phrasebook from './views/Phrasebook';
import Settings from './views/Settings';
import Help from './views/Help';
import LanguageList from './views/LanguageList';
import Ocr from './views/Ocr';
import BiggerText from './views/BiggerText';

const history = syncHistoryWithStore(hashHistory, store);

const renderRoutes = () => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRoute component={Home} />
      <Route path="phrasebook" component={Phrasebook} />
      <Route path="settings" component={Settings} />
      <Route path="help" component={Help} />
      <Route path="language-list" component={LanguageList} />
      <Route path="ocr" component={Ocr} />
      <Route path="bigger-text" component={BiggerText} />
    </Route>
  </Router>
);


export default renderRoutes;
