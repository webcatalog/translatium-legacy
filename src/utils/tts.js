/* global WinJS */
import { getGoogleTkk, generateGoogleTranslateToken } from '../lib/token';

let player = null;
let promise = null;
let currentTimestamp;

const playAsync = () =>
  new Promise(
    (resolve, reject) => {
      player.play();
      player.onended = () => resolve();
      player.onerror = () => reject();
    }
  );

const ttsShortText = (lang, text, idx, total) =>
  getGoogleTkk()
    .then((tkk) => {
      const uri = encodeURI(
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}`
        + `&q=${text}&textlen=${text.length}&idx=${idx}&total=${total}`
        + `&client=t&prev=input&tk=${generateGoogleTranslateToken(text, tkk)}`
      );
      return fetch(uri);
    })
    .then(res => res.blob())
    .then(blob => {
      if (blob) {
        const uri = URL.createObjectURL(blob, { oneTimeOnly: true });
        player = new Audio(uri);
        return playAsync();
      }
      return Promise.reject('Fail to get blob');
    });


export default class TTSUtils {
  static stop() {
    if (player) player.pause();
    currentTimestamp = null;
  }

  static ttsText(lang, text) {
    currentTimestamp = Date.now();
    const timestamp = currentTimestamp;

    if (player) player.pause();

    promise = Promise.resolve()
      .then(() => {
        const strArr = [];
        let t = text;
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
      .then(strArr => {
        let i = 0;
        const cF = () => {
          if (currentTimestamp !== timestamp) {
            return null;
          }

          return ttsShortText(lang, strArr[i], i, strArr.length)
            .then(() => {
              if (i < strArr.length - 1) {
                i++;
                return cF();
              }
              return null;
            });
        };

        return cF();
      });

    return promise;
  }
}
