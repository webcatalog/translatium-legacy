export const getMicrosoftTranslatorAppId = () => {
  const uri = 'https://www.bing.com/translator/dynamic/223578/js/LandingPage.js';
  return fetch(uri)
    .then(res => res.text())
    .then(body =>
      // Look for appId in JS file
      body.substr(body.indexOf('appId:') + 6, 47)
    );
};
