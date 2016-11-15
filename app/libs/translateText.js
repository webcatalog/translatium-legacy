/* global fetch */

import generateGoogleTranslateToken from './generateGoogleTranslateToken';
import * as languageUtils from './languageUtils';
import winXhr from './winXhr';

// Maximum encoded inputText length: 2000
const translateShortText = (inputLang, outputLang, inputText) =>
  generateGoogleTranslateToken(inputText)
    .then((token) => {
      const uri = 'https://translate.google.com/translate_a/single?client=t'
              + `&sl=${languageUtils.toGoogleStandardlizedLanguage(inputLang)}`
              + `&tl=${languageUtils.toGoogleStandardlizedLanguage(outputLang)}&hl=en&dt=`
              + 'bd&dt=ex&dt=ld&dt=md&dt=qc&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8'
              + `&source=btn&kc=0&ssel=4&tsel=4&tk=${token}&q=${encodeURIComponent(inputText)}`;

      switch (process.env.PLATFORM) {
        case 'windows': {
          return winXhr({
            type: 'get',
            uri,
            responseType: 'text',
          });
        }
        default: {
          return fetch(uri)
            .then(response => response.text());
        }
      }
    })
    /* eslint-disable */
    .then(body => eval(body))
    /* eslint-enable */
    .then((result) => {
      let outputText = '';
      let inputRoman;
      let outputRoman;
      if (result[0]) {
        result[0].forEach((part) => {
          if (part[0]) {
            outputText += part[0];
          } else {
            if (part[2]) outputRoman = (outputRoman) ? outputRoman + part[2] : part[2];
            if (part[3]) inputRoman = (inputRoman) ? inputRoman + part[3] : part[3];
          }
        });
      }
      if (outputLang === 'zh-YUE') outputRoman = undefined;

      let outputSegments = [outputText];
      if (result[5]) {
        outputSegments = result[5].map((segment) => {
          const outputArr = segment[2] ?
                              segment[2].map(arr => ({ text: arr[0], accuracy: arr[1] })) : null;

          return {
            inputText: segment[0],
            outputArr,
          };
        });
      }

      let detectedInputLang = result[2];
      if (detectedInputLang === 'zh-CN') detectedInputLang = 'zh';

      let inputDict;
      if ((result[11]) || (result[12]) || (result[13]) || (result[14])) {
        inputDict = [result[11], result[12], result[13], result[14]];
      }

      const outputDict = result[1];

      let suggestedInputLang;
      // sometimes, suggestedInputLang === inputLang so compare to ensure it's not duplicated.
      if (result[8] && result[8][0][0] !== inputLang) {
        suggestedInputLang = result[8][0][0];
      }
      if (suggestedInputLang === 'zh-CN') suggestedInputLang = 'zh';

      let suggestedInputText;
      if (result[7] && result[7][1].length < 100) { // only keep suggestion if length < 1000
        suggestedInputText = result[7][1];
      }
      return {
        outputText,
        inputRoman,
        outputRoman,
        outputSegments,
        detectedInputLang,
        inputDict,
        outputDict,
        suggestedInputLang,
        suggestedInputText,
      };
    });

// Split text to chucks of short-length strings, translate with Google and then merge them together
const translateText = (inputLang, outputLang, inputText) =>
  Promise.resolve()
    .then(() => {
      if (encodeURIComponent(inputText).length < 1000) {
        return translateShortText(inputLang, outputLang, inputText);
      }

      let tmp = inputText.substr(0, 100);
      for (let i = 200; i < inputText.length; i += 100) {
        if (encodeURIComponent(inputText.substr(0, i)).length > 1000) {
          break;
        }
        tmp = inputText.substr(0, i);
      }

      let last = tmp.lastIndexOf(' ');
      if (last === -1) last = tmp.length - 1;
      const leftInputText = tmp.substr(0, last);
      const rightInputText = inputText.substr(last + 1, inputText.length - leftInputText.length);
      let leftRes;
      let rightRes;
      const promises = [];
      promises.push(translateShortText(inputLang, outputLang, leftInputText)
        .then((result) => {
          leftRes = result;
        }));

      promises.push(translateText(inputLang, outputLang, rightInputText)
        .then((result) => {
          rightRes = result;
        }));

      return Promise.all(promises).then(() => {
        if ((!leftRes) || (!rightRes)) return Promise.reject(new Error('Failed'));
        return {
          outputText: `${leftRes.outputText} ${rightRes.outputText}`,
          inputRoman: (leftRes.inputRoman && rightRes.inputRoman) ?
                          `${leftRes.inputRoman} ${rightRes.inputRoman}` : null,
          outputRoman: (leftRes.outputRoman && rightRes.outputRoman) ?
                          `${leftRes.outputRoman} ${rightRes.outputRoman}` : null,
          outputSegments: leftRes.outputSegments.concat(rightRes.outputSegments),
          detectedInputLang: leftRes.detectedInputLang,
        };
      });
    });

export default translateText;
