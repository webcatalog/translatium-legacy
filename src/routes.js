import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import App from './components/app';

import Home from './components/pages/home';
import Phrasebook from './components/pages/phrasebook';
import Settings from './components/pages/settings';
import LanguageList from './components/pages/language-list';
import Ocr from './components/pages/ocr';
import BiggerText from './components/pages/bigger-text';


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
