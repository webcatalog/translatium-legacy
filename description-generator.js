/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const fs = require('fs-extra');
const path = require('path');

const displayLanguages = require('./main-src/libs/locales/languages');

const localesDir = path.resolve(__dirname, 'main-src', 'libs', 'locales');
Object.keys(displayLanguages).forEach((langCode) => {
  // eslint-disable-next-line no-console
  console.log(`Generating description for ${langCode}...`);
  const rawDesc = fs.readFileSync(path.join(localesDir, langCode, 'description.txt'), 'utf8');

  const supportedLanguageStrings = fs.readJsonSync(path.join(localesDir, langCode, 'languages.json'));
  const supportedLanguages = Object.keys(supportedLanguageStrings)
    .filter((code) => code !== 'auto')
    .map((code) => supportedLanguageStrings[code])
    .sort((x, y) => x.localeCompare(y));

  ['macOS', 'Windows', 'Linux'].forEach((operatingSystem) => {
    const desc = rawDesc
      .replace(/{appName}/g, 'Translatium')
      .replace(/{operatingSystem}/g, operatingSystem)
      .replace(/{appUrl}/g, 'https://webcatalog.io/translatium/')
      .replace(/{supportedLanguages}/g, supportedLanguages.join(langCode === 'zh-CN' ? '，' : ', '));
    const distDescFilePath = path.join(__dirname, 'dist', 'description', langCode, `${operatingSystem}.txt`);
    fs.outputFileSync(distDescFilePath, desc, 'utf8');
  });
});
