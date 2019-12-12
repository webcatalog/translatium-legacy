import { getLocales } from '../senders';

let locales;

const getLocale = (id) => {
  if (locales == null) locales = getLocales();
  if (!locales[id]) throw Error('Locale ID is not available.');
  return locales[id];
};

export default getLocale;
