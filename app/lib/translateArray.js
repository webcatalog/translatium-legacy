/* global Windows */

import translateText from './translateText';

const translateArray = (inputLang, outputLang, inputArr, options) =>
  Promise.resolve()
    .then(() => {
      const inputText = inputArr.join('\n');
      return translateText(inputLang, outputLang, inputText, options);
    })
    .then(({ outputText }) => ({
      outputArr: outputText.split('\n'),
    }));

export default translateArray;
