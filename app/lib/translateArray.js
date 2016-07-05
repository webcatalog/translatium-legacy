/* global Windows */

import generateGoogleTranslateToken from './generateGoogleTranslateToken';
import * as languageUtils from './languageUtils';

import httpClient from './httpClient';

const fetchJson = (uriString) => {
  const uri = new Windows.Foundation.Uri(uriString);
  const promise = new Promise((resolve, reject) => {
    httpClient.getAsync(uri)
      .then(response => {
        response.ensureSuccessStatusCode();
        return response.content.readAsStringAsync();
      })
      .done(
        body => { resolve(JSON.parse(body)); },
        err => { reject(err); }
      );
  });

  return promise;
};

const translateArray = (initInputLang, initOutputLang, inputArr, options) =>
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
          translateArray(inputLang, outputLang, nextArr)
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
      return fetchJson(uri)
        .then(outputArr => {
          const result = {
            outputArr,
            provider: 'Google',
          };
          return result;
        });
    });

export default translateArray;
