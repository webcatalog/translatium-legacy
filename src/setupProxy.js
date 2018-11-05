// https://stackoverflow.com/questions/52605997/when-specified-proxy-in-package-json-must-be-a-string

const proxy = require('http-proxy-middleware');

module.exports = function loadProxy(app) {
  app.use(proxy('/m/translate', { target: 'https://translate.google.com', changeOrigin: true }));
  app.use(proxy('/translate_a', { target: 'https://translate.google.com', changeOrigin: true }));
  app.use(proxy('/translate_tts', { target: 'https://translate.google.com', changeOrigin: true, ws: true }));
  app.use(proxy('/speech-api', { target: 'https://www.google.com', changeOrigin: true }));
};
