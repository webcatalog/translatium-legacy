/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const displayLanguages = {
  de: {
    displayName: 'Deutsch',
  },
  en: {
    displayName: 'English',
  },
  es: {
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
  pt: {
    displayName: 'Português',
  },
  ja: {
    displayName: '日本語',
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
