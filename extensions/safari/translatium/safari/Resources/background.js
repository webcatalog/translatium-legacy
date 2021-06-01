/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const browser = window.browser || window.chrome;

browser.menus.create({
  id: 'translate-with-translatium',
  title: browser.i18n.getMessage('extName'),
  contexts: ['selection'],
}, () => {
  if (browser.runtime.lastError) {
    // eslint-disable-next-line no-console
    console.log(`Got expected error: ${browser.runtime.lastError.message}`);
  }
});

browser.menus.onClicked.addListener((o) => {
  // handle context menu actions
  if (o && o.selectionText) {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length < 0) return;
      const tab = tabs[0];
      browser.tabs.update(tab.id, {
        url: `translatium://?text=${encodeURIComponent(o.selectionText)}`,
      });
    });
  }
});
