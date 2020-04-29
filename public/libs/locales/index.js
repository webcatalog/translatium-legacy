const locales = require('./en.json');

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
