import { getLocales } from '../senders';

let locales;

const getLocale = (id) => {
  if (locales == null) locales = getLocales();
  if (!locales[id]) {
    console.log('Missing locale id', id); // eslint-disable-line no-console
    return id;
  }
  return locales[id];
};

export default getLocale;
