/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global chrome */
chrome.contextMenus.create({
  id: 'translate-with-translatium',
  title: 'Translate with Translatium',
  contexts: ['selection'],
}, () => {
  if (chrome.runtime.lastError) {
    // eslint-disable-next-line no-console
    console.log(`Got expected error: ${chrome.runtime.lastError.message}`);
  }
});

chrome.contextMenus.onClicked.addListener((o) => {
  // handle context menu actions
  if (o && o.selectionText) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length < 0) return;
      const tab = tabs[0];
      chrome.tabs.update(tab.id, {
        url: `translatium://?text=${encodeURIComponent(o.selectionText)}`,
      });
    });
  }
});
