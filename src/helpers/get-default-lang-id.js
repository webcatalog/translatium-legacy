const { remote } = window.require('electron');

const getLanguageCode = (langId) => {
  const parts = langId.toLowerCase().replace('_', '-').split('-');

  return parts[0];
};

const getDefaultLangId = () => {
  const userLanguages = [remote.app.getLocale()];
  let defaultLangId = 'en';

  userLanguages.some((userLang) => {
    let isMatch = false;

    ['en'].some((appLang) => {
      isMatch = getLanguageCode(appLang) === getLanguageCode(userLang);

      if (isMatch) {
        defaultLangId = appLang;
      }

      return isMatch;
    });

    return isMatch;
  });

  return defaultLangId;
};

export default getDefaultLangId;
