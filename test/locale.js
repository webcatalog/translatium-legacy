/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global describe it */
const { expect } = require('chai');
const fs = require('fs-extra');
const path = require('path');

describe('All localized languages have valid keys/values', () => {
  const localesDir = path.resolve(__dirname, '..', 'main-src', 'libs', 'locales');
  const defaultKeys = Object.keys(
    fs.readJSONSync(path.join(localesDir, 'en', 'languages.json')),
  ).concat(Object.keys(
    fs.readJSONSync(path.join(localesDir, 'en', 'ui.json')),
  ));

  // eslint-disable-next-line global-require
  const displayLanguages = require('../main-src/libs/locales/languages');
  Object.keys(displayLanguages).forEach((langCode) => {
    it(langCode, () => {
      const keys = Object.keys(
        fs.readJSONSync(path.join(localesDir, langCode, 'languages.json')),
      ).concat(Object.keys(
        fs.readJSONSync(path.join(localesDir, langCode, 'ui.json')),
      ));

      expect(keys).to.deep.equal(defaultKeys);
    });
  });
});
