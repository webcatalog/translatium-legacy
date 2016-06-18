import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';

import Layout from './views/Layout';

import Home from './views/Home';
import Settings from './views/Settings';
import About from './views/About';
import Ocr from './views/Ocr';
import ChooseLanguage from './views/ChooseLanguage';
import BigText from './views/BigText';
import Phrasebook from './views/Phrasebook';

export default (
  <Router>
    <Route path="/" component={Layout}>
      <IndexRoute component={Home} />
      <Route path="settings" component={Settings} />
      <Route path="about" component={About} />
      <Route path="choose-a-language" component={ChooseLanguage} />
      <Route path="ocr" component={Ocr} />
      <Route path="big-text" component={BigText} />
      <Route path="favorites" component={Phrasebook} />
    </Route>
  </Router>
);
