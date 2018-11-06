/* global it */

const harness = require('./utils/_harness');

harness('store-test', () => {
  it('Load Translatium', () =>
    global.app.client
      .waitForVisible('.jss1'));
}, [
  '--testing=true',
]);
