import { getLocales } from '../senders';

const locales = getLocales();

const getLocale = (id) => {
  if (!locales[id]) {
    console.log('Missing locale id', id); // eslint-disable-line no-console
    return id;
  }
  return locales[id];
};

export default getLocale;
