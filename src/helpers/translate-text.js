/* global fetch */
// https://tech.yandex.com/translate/doc/dg/reference/translate-docpage/
import { transliterate as tr } from 'transliteration';

// https://tech.yandex.com/dictionary/doc/dg/reference/getLangs-docpage/
const dictPairs = [
  'be-be', 'be-ru', 'bg-ru', 'cs-cs', 'cs-en', 'cs-ru', 'da-en',
  'da-ru', 'de-de', 'de-en', 'de-ru', 'de-tr', 'el-en', 'el-ru',
  'en-cs', 'en-da', 'en-de', 'en-el', 'en-en', 'en-es', 'en-et',
  'en-fi', 'en-fr', 'en-it', 'en-lt', 'en-lv', 'en-nl', 'en-no',
  'en-pt', 'en-ru', 'en-sk', 'en-sv', 'en-tr', 'en-uk', 'es-en',
  'es-es', 'es-ru', 'et-en', 'et-ru', 'fi-en', 'fi-ru', 'fi-fi',
  'fr-fr', 'fr-en', 'fr-ru', 'hu-hu', 'hu-ru', 'it-en', 'it-it',
  'it-ru', 'lt-en', 'lt-lt', 'lt-ru', 'lv-en', 'lv-ru', 'mhr-ru',
  'mrj-ru', 'nl-en', 'nl-ru', 'no-en', 'no-ru', 'pl-ru', 'pt-en',
  'pt-ru', 'ru-be', 'ru-bg', 'ru-cs', 'ru-da', 'ru-de', 'ru-el',
  'ru-en', 'ru-es', 'ru-et', 'ru-fi', 'ru-fr', 'ru-hu', 'ru-it',
  'ru-lt', 'ru-lv', 'ru-mhr', 'ru-mrj', 'ru-nl', 'ru-no', 'ru-pl',
  'ru-pt', 'ru-ru', 'ru-sk', 'ru-sv', 'ru-tr', 'ru-tt', 'ru-uk',
  'sk-en', 'sk-ru', 'sv-en', 'sv-ru', 'tr-de', 'tr-en', 'tr-ru',
  'tt-ru', 'uk-en', 'uk-ru', 'uk-uk'];

const translateText = (inputLang, outputLang, inputText) => {
  const lang = inputLang === 'auto' ? outputLang : `${inputLang}-${outputLang}`;

  const output = {
    inputLang, outputLang,
  };

  const p = [];

  const transUrl = 'https://translate.yandex.net/api/v1.5/tr.json/translate'
                 + `?key=${process.env.REACT_APP_YANDEX_TRANSLATE_API_KEY}`
                 + `&text=${encodeURIComponent(inputText)}`
                 + `&lang=${lang}`
                 + '&format=plain';
  p.push(
    fetch(transUrl)
      .then(response => response.json())
      .then((response) => {
        output.outputText = response.text[0];
        output.outputRoman = outputLang === 'zh' ? tr(response.text[0]) : undefined;
        output.inputRoman = inputLang === 'zh' ? tr(inputText) : undefined;
      }),
  );

  // Try to get dict if length of input text is less than 30 characters and 3 words
  const singleLang = `${inputLang}-${inputLang}`;
  const dualLang = `${inputLang}-${outputLang}`;
  const shouldGetDict = (dictPairs.indexOf(dualLang) > -1 || dictPairs.indexOf(singleLang) > -1)
    && (inputText.length < 30 && inputText.split(' ').length < 3);
  if (shouldGetDict) {
    const dictLang = dictPairs.indexOf(lang) > -1 ? lang : singleLang;
    const dictUrl = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup'
                   + `?key=${process.env.REACT_APP_YANDEX_DICTIONARY_API_KEY}`
                   + `&text=${encodeURIComponent(inputText)}`
                   + `&lang=${dictLang}`;
    p.push(
      fetch(dictUrl)
        .then(response => response.json())
        .then((response) => {
          output.outputDict = {
            lang: dictLang,
            def: response.def,
          };
        })
        .catch(() => {
          // It's ok not to have dictionary data
        }),
    );
  }

  return Promise.all(p)
    .then(() => output);
};

export default translateText;
