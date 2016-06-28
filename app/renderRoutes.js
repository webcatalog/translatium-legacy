import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import store from './store';

import Layout from './views/Layout';

import Home from './views/Home';
import Settings from './views/Settings';
import About from './views/About';
import ChooseLanguage from './views/ChooseLanguage';
import Phrasebook from './views/Phrasebook';
import Ocr from './views/Ocr';
import BigText from './views/BigText';

const history = syncHistoryWithStore(hashHistory, store);

const renderRoutes = () => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRoute component={Home} />
      <Route path="settings" component={Settings} />
      <Route path="about" component={About} />
      <Route path="choose-language" component={ChooseLanguage} />
      <Route path="phrasebook" component={Phrasebook} />
      <Route path="ocr" component={Ocr} />
      <Route path="big-text" component={BigText} />
    </Route>
  </Router>
);


export default renderRoutes;
