import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import App from './app';

import Home from './pages/home';
import Phrasebook from './pages/phrasebook';
import Settings from './pages/settings';
import LanguageList from './pages/language-list';
import Ocr from './pages/ocr';
import BiggerText from './pages/bigger-text';


const renderRoutes = (store) => {
  const history = syncHistoryWithStore(hashHistory, store);

  return (
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
};


export default renderRoutes;
