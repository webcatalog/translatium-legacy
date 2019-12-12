/* eslint-disable no-console */
// automate localization using Yandex Translate
require('dotenv').config();

const path = require('path');
const fsExtra = require('fs-extra');

global.fetch = require('node-fetch');
const translateText = require('./src/helpers/translate-text').default;

const localeDir = path.resolve(__dirname, 'public', 'libs', 'locales');

// use English locales as base
const enLocales = fsExtra.readJsonSync(path.resolve(localeDir, 'en.json'));

// get name of other locales other than en.json
const localeLangIds = fsExtra.readdirSync(localeDir)
  .filter((name) => name.endsWith('.json') && name !== 'en.json');

localeLangIds.forEach((localeJson) => {
  console.log(`Localizating ${localeJson}...`);

  const locales = fsExtra.readJsonSync(path.resolve(localeDir, localeJson));

  const newLocales = {};
  const p = Object.keys(enLocales).map(async (key) => {
    if (locales[key]) {
      newLocales[key] = locales[key];
    } else {
      newLocales[key] = null;
      const translateTextRes = await translateText('en', localeJson.replace('.json', ''), enLocales[key]);
      newLocales[key] = translateTextRes.outputText;
    }
  });

  Promise.all(p).then(() => {
    console.log(`Done ${localeJson}.`);
    fsExtra.writeJsonSync(path.resolve(localeDir, localeJson), newLocales, {
      spaces: '\t',
    });
  });
});
