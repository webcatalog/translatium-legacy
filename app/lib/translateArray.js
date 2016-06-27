import generateGoogleTranslateToken from './generateGoogleTranslateToken';
import * as languageUtils from './languageUtils';
import getMicrosoftTranslatorAppId from './getMicrosoftTranslatorAppId';

const translateArrayWithGoogle = (initInputLang, initOutputLang, inputArr, options) =>
  generateGoogleTranslateToken(inputArr.join(''))
    .then(token => {
      const inputLang = languageUtils.googleStandardlizedLanguage(initInputLang);
      const outputLang = languageUtils.googleStandardlizedLanguage(initOutputLang);

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
              return Promise.reject(new Error('Failed'));
            }
            return { outputArr: leftArr.concat(rightArr) };
          });
      }

      // Else just translate & return
      return fetch(uri)
        .then(res => res.json())
        .then(outputArr => {
          const result = {
            outputArr,
            provider: 'Google',
          };
          return result;
        });
    });

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
        return Promise.reject(new Error('AppId is not correct'));
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

const translateArray = (inputLang, outputLang, inputArr, options) => {
  if (inputArr.length < 1) {
    return Promise.reject(new Error('empty array'));
  }

  return Promise.resolve()
    .then(() => {
      // Cross-translation between Google & Microsoft, using English as a bridge
      if (languageUtils.isOnlyMicrosoftSupported(inputLang)) {
        if (languageUtils.isMicrosoftSupported(outputLang)) {
          return translateArrayWithMicrosoft(inputLang, outputLang, inputArr);
        }

        return translateArrayWithMicrosoft(inputLang, 'en', inputArr)
          .then(result => translateArrayWithGoogle('en', outputLang, result.outputArr))
          .then(result => {
            const r = result;
            r.provider = 'Google + Microsoft';
            return r;
          });
      }

      if (languageUtils.isOnlyMicrosoftSupported(outputLang)) {
        if (languageUtils.isMicrosoftSupported(inputLang)) {
          return translateArrayWithMicrosoft(inputLang, outputLang, inputArr);
        }

        return translateArrayWithGoogle(inputLang, 'en', inputArr)
          .then(result => translateArrayWithMicrosoft('en', outputLang, result.outputArr))
          .then(result => {
            const r = result;
            r.provider = 'Google + Microsoft';
            return r;
          });
      }

      if (options && options.preferredProvider === 'microsoft'
        && languageUtils.isMicrosoftSupported(inputLang)
        && languageUtils.isMicrosoftSupported(outputLang)) {
        return translateArrayWithMicrosoft(inputLang, outputLang, inputArr);
      }
      return translateArrayWithGoogle(inputLang, outputLang, inputArr);
    });
};

export default translateArray;
