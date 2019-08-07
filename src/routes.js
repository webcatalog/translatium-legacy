import React from 'react';
import {
  Router, Route, IndexRoute, hashHistory,
} from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import AppWrapper from './components/app-wrapper';

import Home from './components/pages/home';
import Phrasebook from './components/pages/phrasebook';
import Preferences from './components/pages/preferences';
import LanguageList from './components/pages/language-list';
import Ocr from './components/pages/ocr';

const renderRoutes = (store) => {
  const history = syncHistoryWithStore(hashHistory, store);

  return (
    <Router history={history}>
      <Route path="/" component={AppWrapper}>
        <IndexRoute component={Home} />
        <Route path="phrasebook" component={Phrasebook} />
        <Route path="preferences" component={Preferences} />
        <Route path="language-list" component={LanguageList} />
        <Route path="ocr" component={Ocr} />
      </Route>
    </Router>
  );
};


export default renderRoutes;
