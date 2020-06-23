/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { app } = require('electron');

const { getPreference } = require('../preferences');

let locales;

const initLocales = () => {
  const langId = getPreference('displayLanguage');
  const uiLocales = require(`./${langId}/ui.json`);
  const languageLocales = require(`./${langId}/languages.json`);
  locales = { ...uiLocales, ...languageLocales };
  Object.keys(locales).forEach((key) => {
    locales[key] = locales[key]
      .replace(/{appName}/g, app.name)
      .replace(/{price}/g, '$9.99');
  });
};

const getLocale = (id) => {
  if (!locales[id]) {
    console.log('Missing locale id', id); // eslint-disable-line no-console
    return id;
  }
  return locales[id];
};

const getLocales = () => locales;

module.exports = {
  initLocales,
  getLocale,
  getLocales,
};
