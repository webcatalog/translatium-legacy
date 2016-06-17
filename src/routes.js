import React from "react"
import { Router, Route, IndexRoute } from "react-router"

import Layout from "views/layout/layout.js"

import HomePage from "views/home-page/home-page.js"
import SettingsPage from "views/settings-page.js"
import AboutPage from "views/about-page.js"
import OcrPage from "views/ocr-page.js"
import ChooseALanguagePage from "views/choose-a-language-page.js"
import DictionaryPage from "views/dictionary-page.js"
import BigTextPage from "views/big-text-page.js"
import FavoritesPage from "views/favorites-page.js"

export default (
  <Router>
    <Route path="/" component={Layout}>
      <IndexRoute component={HomePage} />
      <Route path="settings" component={SettingsPage} />
      <Route path="about" component={AboutPage} />
      <Route path="choose-a-language" component={ChooseALanguagePage} />
      <Route path="ocr" component={OcrPage} />
      <Route path="dictionary" component={DictionaryPage} />
      <Route path="big-text" component={BigTextPage} />
      <Route path="favorites" component={FavoritesPage} />
    </Route>
  </Router>
)
