/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global fetch */
import getTokenFromText from './get-token-from-text';
import delayAsync from '../delay-async';

let fallbackId = 0;
// retry with different endpoints at least 5 times
const makeRequestAsync = (inputLang, outputLang, inputText, retry = 5) => Promise.resolve()
  .then(() => {
    if (fallbackId === 0) {
      // same endpoint as Google Translate Chrome extension
      // do not use translate.google.com endpoint as it has request limit
      const tk = getTokenFromText(inputText);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLang}&tl=${outputLang}&hl=en-US&dt=t&dt=bd&dt=qc&dt=rm&dj=1&source=icon&tk=${tk}&q=${encodeURIComponent(inputText)}`;
      return fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
        },
      });
    }
    // backup endpoints
    // clients1.google.com -> 2,3,4 -> clients5.google.com
    if (fallbackId > 0) {
      const url = `http://clients${fallbackId}.google.com/translate_a/t?client=dict-chrome-ex&q=${encodeURIComponent(inputText)}&sl=${inputLang}&tl=${outputLang}&tbb=1&ie=UTF-8&oe=UTF-8&hl=en`;
      return fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
        },
      });
    }

    return null;
  })
  .then((response) => {
    if (response.ok) {
      return response;
    }

    // swap endpoint if receiving error (mostly 429)
    // isRetry to avoid endless loop when all endpoints fail
    if (retry > 0) {
      fallbackId = fallbackId >= 5 ? 0 : fallbackId + 1;
      return makeRequestAsync(inputLang, outputLang, inputText, retry - 1);
    }

    return Promise.reject(new Error('Something went wrong.'));
  })
  .catch((err) => {
    // swap endpoint if receiving error
    // isRetry to avoid endless loop when all endpoints fail
    if (retry > 0) {
      fallbackId = fallbackId >= 5 ? 0 : fallbackId + 1;
      return makeRequestAsync(inputLang, outputLang, inputText, retry - 1);
    }

    return Promise.reject(err);
  });

const translateText = (inputLang, outputLang, inputText) => Promise.resolve()
  .then(() => delayAsync(300)) // delay to avoid request limit
  .then(() => makeRequestAsync(inputLang, outputLang, inputText))
  .then((res) => res.json())
  .then((result) => {
    const outputText = result.sentences.map((sentence) => sentence.trans).join('');
    const outputRoman = result.sentences.map((sentence) => sentence.translit).join('');
    const inputRoman = result.sentences.map((sentence) => sentence.src_translit).join('');
    const outputDict = result.dict;

    return {
      inputLang: inputLang === 'auto' ? result.src : inputLang,
      outputLang,
      inputText,
      outputText,
      outputRoman,
      inputRoman,
      outputDict,
      source: 'translate.googleapis.com',
    };
  });

export default translateText;
