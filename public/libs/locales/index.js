const fsExtra = require('fs-extra');
const path = require('path');
const { getPreference } = require('../preferences');

let locales;

const initLocales = () => {
  let langId = getPreference('langId');
  if (!fsExtra.existsSync(path.resolve(__dirname, `${langId}.json`))) {
    langId = 'en';
  }

  locales = fsExtra.readJsonSync(path.resolve(__dirname, `${langId}.json`));
};

const getLocale = (id) => {
  if (locales == null) initLocales();
  if (!locales[id]) {
    console.log('Missing locale id', id); // eslint-disable-line no-console
    return id;
  }
  return locales[id];
};

const getLocales = () => {
  if (locales == null) initLocales();
  return locales;
};

module.exports = {
  getLocale,
  getLocales,
};
