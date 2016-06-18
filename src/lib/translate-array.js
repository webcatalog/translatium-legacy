import * as TokenUtils from './token.js';
import * as LanguageUtils from './language.js';
import { getMicrosoftTranslatorAppId } from './get-app-id.js';

const translateArrayWithGoogle = (inputLang, outputLang, inputArr, options) => {
  inputLang = LanguageUtils.googleStandardlizedLanguage(inputLang);
  outputLang = LanguageUtils.googleStandardlizedLanguage(outputLang);
  const token = TokenUtils.generateGoogleTranslateToken(inputArr.join(''));

  let uri = `/translate_a/t?client=mt&sl=${inputLang}&tl=${outputLang}&hl=en&v=1.0&tk=${token}`;

  if (options && options.chinaMode === true) {
    uri = `http://translate.google.cn/${uri}`;
  } else {
    uri = `https://translate.google.com/${uri}`;
  }

  // Split to small chunk if the array is too big
  // If not, add it to URI
  let nextArr = [];
  for (let i = 0; i < inputArr.length; i++) {
    if (encodeURI(`${uri}&q=${inputArr[i]}`).length > 2000) {
      nextArr = inputArr.slice(i, inputArr.length);
      break;
    } else {
      uri += `&q=${inputArr[i]}`;
    }
  }

  uri = encodeURI(uri);

  // If there are multiple chunks, translate all of them and merge them together
  if (nextArr.length > 0) {
    const promises = [];
    let leftArr;
    let rightArr;
    promises.push(
      fetch(uri)
        .then(res => res.json())
        .then(outputArr => {
          leftArr = outputArr;
        })
    );
    promises.push(
      translateArrayWithGoogle(inputLang, outputLang, nextArr)
        .then(result => {
          rightArr = result.outputArr;
        })
    );
    return Promise.all(promises)
      .then(() => {
        if ((!leftArr) || (!rightArr)) {
          return Promise.reject('Failed');
        }
        return { outputArr: leftArr.concat(rightArr) };
      });
  }

  // Else just translate & return
  return fetch(uri)
    .then(res => res.json())
    .then(outputArr => {
      if (typeof outputArr !== 'object') outputArr = [outputArr];
      const result = {
        outputArr,
        provider: 'Google',
      };
      return result;
    });
};

const translateArrayWithMicrosoft = (inputLang, outputLang, inputArr) =>
  getMicrosoftTranslatorAppId()
    .then(appId => {
      const inputTexts = JSON.stringify(inputArr);
      const uri = encodeURI(
                    `https://api.microsofttranslator.com/v2/ajax.svc/TranslateArray2?appId=${appId}`
                    + `&texts=${inputTexts}`
                    + `&from=${inputLang}`
                    + `&to=${outputLang}`
                    + '&options={}'
                  );
      return fetch(uri);
    })
    .then(res => res.text())
    .then(body => JSON.parse(body.trim()))
    .then(result => {
      if (typeof result !== 'object') {
        return Promise.reject('AppId is not correct');
      }
      const arr = result.map(x => x.TranslatedText);

      return arr;
    })
    .then(outputArr => {
      const result = {
        outputArr,
        provider: 'Microsoft',
      };
      return result;
    });

export const translateArray = (inputLang, outputLang, inputArr, options) => {
  if (inputArr.length < 1) {
    return Promise.resolve({
      status: 0,
    });
  }

  return Promise.resolve()
    .then(() => {
      // Cross-translation between Google & Microsoft, using English as a bridge
      if (LanguageUtils.isOnlyMicrosoftSupported(inputLang)) {
        if (LanguageUtils.isMicrosoftSupported(outputLang)) {
          return translateArrayWithMicrosoft(inputLang, outputLang, inputArr);
        }

        return translateArrayWithMicrosoft(inputLang, 'en', inputArr)
          .then(result => translateArrayWithGoogle('en', outputLang, result.outputArr))
          .then(result => {
            result.provider = 'Google + Microsoft';
            return result;
          });
      }

      if (LanguageUtils.isOnlyMicrosoftSupported(outputLang)) {
        if (LanguageUtils.isMicrosoftSupported(inputLang)) {
          return translateArrayWithMicrosoft(inputLang, outputLang, inputArr);
        }

        return translateArrayWithGoogle(inputLang, 'en', inputArr)
          .then(result => translateArrayWithMicrosoft('en', outputLang, result.outputArr))
          .then(result => {
            result.provider = 'Google + Microsoft';
            return result;
          });
      }

      if (options && options.preferredProvider === 'microsoft'
        && LanguageUtils.isMicrosoftSupported(inputLang)
        && LanguageUtils.isMicrosoftSupported(outputLang)) {
        return translateArrayWithMicrosoft(inputLang, outputLang, inputArr);
      }

      return translateArrayWithGoogle(inputLang, outputLang, inputArr);
    });
};
