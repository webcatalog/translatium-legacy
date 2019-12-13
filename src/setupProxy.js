const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(proxy('/translate_tts',
    {
      target: 'https://translate.google.com',
      changeOrigin: true,
      ws: true,
    }));
};
