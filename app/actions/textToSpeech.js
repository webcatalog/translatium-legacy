/* global Windows */

import { PLAY_TTS, STOP_TTS } from '../constants/actions';

import generateGoogleTranslateToken from '../lib/generateGoogleTranslateToken';
import i18n from '../i18n';
import httpClient from '../lib/httpClient';

let player = null;
let currentTimestamp;

const fetchBlob = (uriString) => {
  const uri = new Windows.Foundation.Uri(uriString);
  const promise = new Promise((resolve, reject) => {
    httpClient.getAsync(uri)
      .then(response => {
        response.ensureSuccessStatusCode();
        return response.content.readAsBufferAsync();
      })
      .done(
        buffer => {
          const reader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
          const bytes = new Uint8Array(buffer.length);
          reader.readBytes(bytes);
          const blob = new Blob([bytes], { type: 'audio/mpeg' });
          resolve(blob);
        },
        err => { reject(err); }
      );
  });

  return promise;
};

const ttsShortText = (lang, text, idx, total) =>
  generateGoogleTranslateToken(text)
    .then(token => {
      const uri = encodeURI(
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}`
        + `&q=${text}&textlen=${text.length}&idx=${idx}&total=${total}`
        + `&client=t&prev=input&tk=${token}`
      );
      return fetchBlob(uri);
    })
    .then(blob => {
      if (blob) {
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

export const playTTS = (ttsLang, ttsText) => ((dispatch) => {
  if (ttsText.length < 1) return;

  dispatch({ type: PLAY_TTS, ttsLang, ttsText });

  currentTimestamp = Date.now();
  const timestamp = currentTimestamp;

  if (player) player.pause();

  Promise.resolve()
    .then(() => {
      const strArr = [];
      let t = ttsText;
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

        return ttsShortText(ttsLang, strArr[i], i, strArr.length)
          .then(() => {
            if (i < strArr.length - 1) {
              i++;
              return cF();
            }
            return null;
          });
      };

      return cF();
    })
    .then(() => {
      dispatch({ type: STOP_TTS });
    })
    .catch(() => {
      dispatch({ type: STOP_TTS });
      const title = i18n('connect-problem');
      const content = i18n('check-connect');
      const msg = new Windows.UI.Popups.MessageDialog(content, title);
      msg.showAsync().done();
    });
});

export const stopTTS = () => ((dispatch) => {
  if (player) player.pause();
  currentTimestamp = null;
  dispatch({ type: STOP_TTS });
});

export const playInputText = () => ((dispatch, getState) => {
  const state = getState();
  dispatch(playTTS(
    state.settings.inputLang,
    state.home.inputText
  ));
});

export const playOutputText = () => ((dispatch, getState) => {
  const state = getState();
  dispatch(playTTS(
    state.settings.outputLang,
    state.home.outputText
  ));
});
