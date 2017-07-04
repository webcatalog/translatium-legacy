import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import store from './store';

import App from './components/App';

import Home from './components/Home';
import Phrasebook from './components/Phrasebook';
import Settings from './components/Settings';
import LanguageList from './components/LanguageList';
import Ocr from './components/Ocr';
import BiggerText from './components/BiggerText';

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
