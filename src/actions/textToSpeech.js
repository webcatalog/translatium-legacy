/* global fetch */

import { PLAY_TEXT_TO_SPEECH, STOP_TEXT_TO_SPEECH } from '../constants/actions';

import getPlatform from '../libs/getPlatform';
import generateGoogleTranslateToken from '../libs/generateGoogleTranslateToken';
import winXhr from '../libs/winXhr';

import { openAlert } from './alert';

let player = null;
let currentTimestamp;

const textToSpeechShortText = (lang, text, idx, total, chinaMode) =>
  generateGoogleTranslateToken(text)
    .then((token) => {
      const endpoint = process.env.REACT_APP_GOOGLE_ENDPOINT || (chinaMode ? 'https://translate.google.cn' : 'https://translate.google.com');

      const uri = encodeURI(
        `${endpoint}/translate_tts?ie=UTF-8&tl=${lang}`
        + `&q=${text}&textlen=${text.length}&idx=${idx}&total=${total}`
        + `&client=t&prev=input&tk=${token}`,
      );

      switch (getPlatform()) {
        case 'windows': {
          return winXhr({
            type: 'get',
            uri,
            responseType: 'blob',
          });
        }
        default: {
          return fetch(uri)
            .then(response => response.blob());
        }
      }
    })
    .then((blob) => {
      if (blob) {
        /* global URL Audio */
        const uri = URL.createObjectURL(blob, { oneTimeOnly: true });
        player = new Audio(uri);
        return new Promise(
          (resolve, reject) => {
            player.play();
            player.onended = () => resolve();
            player.onerror = () => reject();
          },
        );
      }
      return Promise.reject(new Error('Fail to get blob'));
    });

export const playTextToSpeech = (textToSpeechLang, textToSpeechText, chinaMode) => ((dispatch) => {
  if (textToSpeechText.length < 1) return;

  dispatch({ type: PLAY_TEXT_TO_SPEECH, textToSpeechLang, textToSpeechText });

  currentTimestamp = Date.now();
  const timestamp = currentTimestamp;

  if (player) player.pause();

  Promise.resolve()
    .then(() => {
      const strArr = [];
      let t = textToSpeechText;
      while (t.length > 0) {
        let stext;
        if (t.length > 100) {
          const tmp = t.substr(0, 99);
          let last = tmp.lastIndexOf(' ');
          if (last === -1) last = tmp.length - 1;
          stext = tmp.substr(0, last);
        } else {
          stext = t;
        }
        strArr.push(stext);
        t = t.substr(stext.length);
      }
      return strArr;
    })
    .then((strArr) => {
      let i = 0;
      const cF = () => {
        if (currentTimestamp !== timestamp) {
          return null;
        }

        return textToSpeechShortText(textToSpeechLang, strArr[i], i, strArr.length, chinaMode)
          .then(() => {
            if (i < strArr.length - 1) {
              i += 1;
              return cF();
            }
            return null;
          });
      };

      return cF();
    })
    .then(() => {
      dispatch({ type: STOP_TEXT_TO_SPEECH });
    })
    .catch(() => {
      dispatch({ type: STOP_TEXT_TO_SPEECH });
      dispatch(openAlert('cannotConnectToServer'));
    });
});

export const stopTextToSpeech = () => ((dispatch) => {
  if (player) player.pause();
  currentTimestamp = null;
  dispatch({ type: STOP_TEXT_TO_SPEECH });
});
