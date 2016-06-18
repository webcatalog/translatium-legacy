import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';

import Layout from './views/layout/layout';

import HomePage from './views/home-page/home-page';
import SettingsPage from './views/settings-page';
import AboutPage from './views/about-page';
import OcrPage from './views/ocr-page';
import ChooseALanguagePage from './views/choose-a-language-page';
import BigTextPage from './views/big-text-page';
import FavoritesPage from './views/favorites-page';

export default (
  <Router>
    <Route path="/" component={Layout}>
      <IndexRoute component={HomePage} />
      <Route path="settings" component={SettingsPage} />
      <Route path="about" component={AboutPage} />
      <Route path="choose-a-language" component={ChooseALanguagePage} />
      <Route path="ocr" component={OcrPage} />
      <Route path="big-text" component={BigTextPage} />
      <Route path="favorites" component={FavoritesPage} />
    </Route>
  </Router>
);
