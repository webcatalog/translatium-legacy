import * as TokenUtils from './token.js';
import * as LanguageUtils from './language.js';
import { getMicrosoftTranslatorAppId } from './get-app-id.js';

// Maximum encoded inputText length: 2000
const translateShortTextWithGoogle = (inputLang, outputLang, inputText, options) => {
  // Make languages Google-compatible
  inputLang = LanguageUtils.googleStandardlizedLanguage(inputLang);
  outputLang = LanguageUtils.googleStandardlizedLanguage(outputLang);
  const token = TokenUtils.generateGoogleTranslateToken(inputText);
  inputText = encodeURIComponent(inputText);

  let uri = `translate_a/single?client=t&sl=${inputLang}&tl=${outputLang}&hl=en&dt=`
          + 'bd&dt=ex&dt=ld&dt=md&dt=qc&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8'
          + `&source=btn&kc=0&ssel=4&tsel=4&tk=${token}&q=${inputText}`;

  if (options && options.chinaMode === true) {
    uri = `http://translate.google.cn/${uri}`;
  } else {
    uri = `https://translate.google.com/${uri}`;
  }

  return fetch(uri)
    .then(res => res.text())
    .then(body => {
      // Convert Google JSON to standard JSON
      let i = 0;
      let jsonStr = '';
      while (i < body.length) {
        if ((body[i] === ',') || (body[i] === '[')) {
          switch (body[i + 1]) {
            case ',':
            case ']': {
              jsonStr += `${body[i]}null`;
              i++;
              break;
            }
            case '"': {
              const tmp = body.substring(i + 2);
              let j = tmp.indexOf('\'');
              while ((tmp[j - 1] === '\\') && (tmp[j - 2] !== '\\')) {
                j = j + 1 + tmp.substring(j + 1).indexOf('\'');
              }
              j = i + 2 + j;
              jsonStr += body.substring(i, j + 1);
              i = j + 1;
              break;
            }
            default: {
              jsonStr += body[i];
              i++;
            }
          }
        } else {
          jsonStr += body[i];
          i++;
        }
      }
      return JSON.parse(jsonStr);
    })
    .then(result => {
      let outputText = '';
      let inputRoman = undefined;
      let outputRoman = undefined;
      if (result[0]) {
        result[0].forEach(part => {
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
        outputSegments = result[5].map(segment => {
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

      let inputDict = undefined;
      if ((result[11]) || (result[12]) || (result[13]) || (result[14])) {
        inputDict = [result[11], result[12], result[13], result[14]];
      }

      const outputDict = result[1];

      let suggestedInputLang = undefined;
      if (result[8]) {
        suggestedInputLang = result[8][0][0];
      }
      if (suggestedInputLang === 'zh-CN') suggestedInputLang = 'zh';

      let suggestedInputText = undefined;
      if (result[7]) {
        suggestedInputText = result[7][1];
      }
      return {
        outputText, inputRoman, outputRoman, outputSegments,
        detectedInputLang, inputDict, outputDict, suggestedInputLang, suggestedInputText,
      };
    });
};

// Split text to chucks of short-length strings, translate with Google and then merge them together
const translateTextWithGoogle = (inputLang, outputLang, inputText, options) =>
  Promise.resolve()
    .then(() => {
      if (encodeURIComponent(inputText).length < 1000) {
        return translateShortTextWithGoogle(inputLang, outputLang, inputText, options);
      }

      let tmp = inputText.substr(0, 100);
      for (let i = 200; i < inputText.length; i = i + 100) {
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
      promises.push(translateShortTextWithGoogle(inputLang, outputLang, leftInputText, options)
        .then(result => {
          leftRes = result;
        }));

      promises.push(translateTextWithGoogle(inputLang, outputLang, rightInputText, options)
        .then(result => {
          rightRes = result;
        }));

      return Promise.all(promises).then(() => {
        if ((!leftRes) || (!rightRes)) return Promise.reject('Failed');
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
    })
    .then(result => {
      result.provider = 'Google';
      return result;
    });

const translateTextWithMicrosoft = (inputLang, outputLang, inputText) =>
  getMicrosoftTranslatorAppId()
    .then(appId => {
      const texts = inputText.split('\n'); // For multi-paragraph
      const uri = encodeURI(`https://api.microsofttranslator.com/v2/ajax.svc/TranslateArray2?appId=${appId}`
                + `&texts=${JSON.stringify(texts)}`
                + `&from=${LanguageUtils.microsoftStandardlizedLanguage(inputLang)}`
                + `&to=${LanguageUtils.microsoftStandardlizedLanguage(outputLang)}`
                + '&options={}');

      return fetch(uri);
    })
    .then(res => res.text())
    .then(body => JSON.parse(body.trim()))
    .then(result => {
      if (typeof result !== 'object') {
        return Promise.reject('AppId is not correct');
      }

      let detectedInputLang = result[0].From;
      if (detectedInputLang === 'zh-CHS') {
        detectedInputLang = 'zh-CN';
      } else if (detectedInputLang === 'zh-CHT') {
        detectedInputLang = 'zh-TW';
      }

      let outputText = '';
      result.forEach(x => {
        outputText += `${x.TranslatedText}\n`;
      });

      return {
        outputText,
        detectedInputLang,
      };
    })
    .then(result => {
      result.provider = 'Microsoft';
      return result;
    });

export const translateText = (inputLang, outputLang, inputText, options) => {
  if (inputText.length < 1) {
    return Promise.resolve({
      status: 0,
    });
  }

  return Promise.resolve()
    .then(() => {
      // Cross-translation between Google & Microsoft, using English as a bridge
      if (LanguageUtils.isOnlyMicrosoftSupported(inputLang)) {
        if (LanguageUtils.isMicrosoftSupported(outputLang)) {
          return translateTextWithMicrosoft(inputLang, outputLang, inputText);
        }

        return translateTextWithMicrosoft(inputLang, 'en', inputText)
          .then(result => translateTextWithGoogle('en', outputLang, result.outputText, options))
          .then(result => {
            const x = result;
            // Delete the unwanted results produced during the translation
            delete x.inputDict;
            delete x.outputDict;
            delete x.suggestedInputLang;
            delete x.suggestedInputText;
            x.provider = 'Google + Microsoft';
            return result;
          });
      }


      if (LanguageUtils.isOnlyMicrosoftSupported(outputLang)) {
        if (LanguageUtils.isMicrosoftSupported(inputLang)) {
          return translateTextWithMicrosoft(inputLang, outputLang, inputText);
        }
        return translateTextWithGoogle(inputLang, 'en', inputText, options)
          .then(result => translateTextWithMicrosoft('en', outputLang, result.outputText))
          .then(result => {
            result.provider = 'Google + Microsoft';
            return result;
          });
      }

      if (options && options.preferredProvider === 'microsoft'
        && LanguageUtils.isMicrosoftSupported(inputLang)
        && LanguageUtils.isMicrosoftSupported(outputLang)) {
        return translateTextWithMicrosoft(inputLang, outputLang, inputText);
      }

      return translateTextWithGoogle(inputLang, outputLang, inputText, options);
    });
};
