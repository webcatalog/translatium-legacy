/* global fetch */
// https://github.com/matheuss/google-translate-token/blob/v1.0.0/index.js#L83
const getGoogleTranslateTkk = () => fetch('https://translate.google.com')
  .then((res) => res.text())
  .then((body) => {
    const code = body.match(/TKK=(.*?)\(\)\)'\);/g);

    if (code) {
      // eslint-disable-next-line no-eval
      return code[0];
    }

    return Promise.reject(new Error('Unable to get Google Translate TKK'));
  });

export default getGoogleTranslateTkk;
