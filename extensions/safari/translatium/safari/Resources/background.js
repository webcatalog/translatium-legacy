const menu = browser.menus.create({
  id: 'translate-with-translatium',
  title: 'Translate with Translatium',
  contexts: ['selection'],
}, () => {
  if (browser.runtime.lastError) {
    console.log("Got expected error: " + browser.runtime.lastError.message);
  }
});

browser.menus.onClicked.addListener((o) => {
  //handle context menu actions
  if (o && o.selectionText) {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length < 0) return;
      const tab = tabs[0];
      browser.tabs.update(tab.id, {
        url: `translatium://?text=${encodeURIComponent(o.selectionText)}`
      });
    });
  }
})
