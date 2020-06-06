/* global fetch */
import getTokenFromText from './get-token-from-text';

const translateText = (inputLang, outputLang, inputText) => Promise.resolve()
  .then(() => getTokenFromText(inputText))
  .then((tk) => {
    // same endpoint as Google Translate Chrome extension
    // do not use translate.google.com endpoint as it has request limit
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLang}&tl=${outputLang}&hl=en-US&dt=t&dt=bd&dt=qc&dt=rm&dj=1&source=icon&tk=${tk}&q=${encodeURIComponent(inputText)}`;
    // const url = `https://translate.googleapis.com/translate_a/single??dt=t&dt=bd&dt=qc&dt=rm&client=gtx&sl=${inputLang}&tl=${outputLang}&dj=1&q=${encodeURIComponent(inputText)}&tk=${tk}&hl=en-US`;
    return fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
      },
    });
  })
  .then((res) => res.json())
  .then((result) => {
    console.log(result);

    const outputText = result.sentences.map((sentence) => sentence.trans).join('');
    const outputRoman = result.sentences.map((sentence) => sentence.translit).join('');
    const inputRoman = result.sentences.map((sentence) => sentence.src_translit).join('');

    console.log(outputText);

    return {
      inputLang,
      outputLang,
      inputText,
      outputText,
      outputRoman,
      inputRoman,
      source: 'translate.googleapis.com',
    };
  });

export default translateText;
