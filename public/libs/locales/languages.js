const displayLanguages = {
  de: {
    displayName: 'Deutsch',
  },
  en: {
    displayName: 'English',
  },
  'es-ES': {
    displayName: 'español',
  },
  fr: {
    displayName: 'français',
  },
  it: {
    displayName: 'italiano',
  },
  ko: {
    displayName: '한국어',
  },
  ru: {
    displayName: 'русский',
  },
  vi: {
    displayName: 'Tiếng Việt',
  },
  'zh-CN': {
    displayName: '中文(简体)',
  },
};

const displayLanguageLst = Object.keys(displayLanguages).map((id) => ({
  id,
  displayName: displayLanguages[id].displayName,
})).sort((x, y) => x.displayName.localeCompare(y.displayName));

const sortedDisplayLanguages = {};
displayLanguageLst.forEach((item) => {
  sortedDisplayLanguages[item.id] = { displayName: item.displayName };
});

module.exports = sortedDisplayLanguages;
