/* global fetch */

import { PLAY_TEXT_TO_SPEECH, STOP_TEXT_TO_SPEECH } from '../constants/actions';

import generateGoogleTranslateToken from '../libs/generateGoogleTranslateToken';

let player = null;
let currentTimestamp;

const textToSpeechShortText = (lang, text, idx, total) =>
  generateGoogleTranslateToken(text)
    .then((token) => {
      const uri = encodeURI(
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}`
        + `&q=${text}&textlen=${text.length}&idx=${idx}&total=${total}`
        + `&client=t&prev=input&tk=${token}`
      );
      return fetch(uri);
    })
    .then(response => response.blob())
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
          }
        );
      }
      return Promise.reject(new Error('Fail to get blob'));
    });

export const playTextToSpeech = (textToSpeechLang, textToSpeechText) => ((dispatch) => {
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

        return textToSpeechShortText(textToSpeechLang, strArr[i], i, strArr.length)
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
      /*
      const title = i18n('connect-problem');
      const content = i18n('check-connect');
      const msg = new Windows.UI.Popups.MessageDialog(content, title);
      msg.showAsync().done();
      */
    });
});

export const stopTextToSpeech = () => ((dispatch) => {
  if (player) player.pause();
  currentTimestamp = null;
  dispatch({ type: STOP_TEXT_TO_SPEECH });
});
