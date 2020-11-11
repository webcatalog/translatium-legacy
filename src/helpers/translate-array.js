/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import translateText from './translate-text';

const translateArray = (inputLang, outputLang, inputArr) => Promise.resolve()
  .then(() => {
    const inputText = inputArr.join('\n');
    return translateText(inputLang, outputLang, inputText);
  })
  .then(({ outputText }) => ({
    outputText,
    outputArr: outputText.split('\n'),
  }));

export default translateArray;
