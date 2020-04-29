const fsExtra = require('fs-extra');
const path = require('path');

const locales = fsExtra.readJsonSync(path.resolve(__dirname, 'en.json'));

const getLocale = (id) => {
  if (!locales[id]) {
    console.log('Missing locale id', id); // eslint-disable-line no-console
    return id;
  }
  return locales[id];
};

const getLocales = () => locales;

module.exports = {
  getLocale,
  getLocales,
};
