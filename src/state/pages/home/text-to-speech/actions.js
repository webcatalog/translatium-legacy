/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { START_TEXT_TO_SPEECH, END_TEXT_TO_SPEECH } from '../../../../constants/actions';
import { isSystemTTSSupported } from '../../../../helpers/language-utils';
import delayAsync from '../../../../helpers/delay-async';
import { nodeFetchBufferAsync } from '../../../../senders';
import { openAlert } from '../../../root/alert/actions';

let player = null;
let currentTaskId = null;
let finishedIdx = -1;
let cachedResponses = {};

const preloadGoogleTTSAsync = (lang, text, idx, total) => () => {
  // avoid preloading is run after the text has been playd
  if (finishedIdx > idx) return Promise.resolve();

  const uri = encodeURI(`https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=${lang}&total=${total}&idx=${idx}&textlen=8&client=dict-chrome-ex&prev=input`);

  const opts = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
    },
  };

  return delayAsync(500) // avoid too many requests
    // use node-fetch because js fetch adds Referer header
    .then(() => nodeFetchBufferAsync(uri, opts))
    .then((buffer) => {
      cachedResponses[uri] = buffer;
    })
    // eslint-disable-next-line no-console
    .catch(console.log);
};

// max length 100 characters
const playGoogleTTSAsync = (lang, text, idx, total) => () => {
  const uri = encodeURI(`https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=${lang}&total=${total}&idx=${idx}&textlen=8&client=dict-chrome-ex&prev=input`);

  const opts = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
    },
  };

  return Promise.resolve()
    .then(() => {
      if (cachedResponses[uri]) {
        return cachedResponses[uri];
      }
      return nodeFetchBufferAsync(uri, opts); // use node-fetch because js fetch adds Referer header
    })
    .then((buffer) => {
      // buffer is a Uint8Array
      const blob = new window.Blob([buffer], { type: 'audio/mp3' });
      const url = window.URL.createObjectURL(blob);
      player = new window.Audio(url);
      return new Promise((resolve, reject) => {
        player.play();
        player.onended = () => resolve();
        player.onerror = (e) => reject(e);
      });
    })
    .then(() => {
      finishedIdx = idx;
    });
};

export const startTextToSpeech = (textToSpeechLang, textToSpeechText) => ((dispatch) => {
  if (textToSpeechText.length < 1) return;

  currentTaskId = Date.now();
  const taskId = currentTaskId;
  cachedResponses = {};

  if (isSystemTTSSupported(textToSpeechLang)) {
    const voices = window.speechSynthesis.getVoices();

    let voice;
    for (let i = 0; i < voices.length; i += 1) {
      if (voices[i].lang.startsWith(textToSpeechLang)) {
        voice = voices[i];
        break;
      }
    }

    dispatch({ type: START_TEXT_TO_SPEECH, textToSpeechLang, textToSpeechText });

    const utterThis = new window.SpeechSynthesisUtterance(textToSpeechText);
    utterThis.voice = voice;
    utterThis.onend = () => {
      dispatch({ type: END_TEXT_TO_SPEECH });
    };

    window.speechSynthesis.speak(utterThis);

    dispatch({ type: START_TEXT_TO_SPEECH });
  } else {
    // split to multiple 100-character chunks
    Promise.resolve()
      .then(() => {
        dispatch({ type: START_TEXT_TO_SPEECH });
        const chunks = [];
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
          chunks.push(stext);
          t = t.substr(stext.length);
        }
        return chunks;
      })
      .then((chunks) => {
        let i = 0;
        const cF = () => {
          if (currentTaskId !== taskId) {
            return null;
          }

          return dispatch(playGoogleTTSAsync(textToSpeechLang, chunks[i], i, chunks.length))
            .then(() => {
              if (i < chunks.length - 1) {
                i += 1;
                return cF();
              }
              return null;
            });
        };

        finishedIdx = -1;

        // preload to avoid interuptions when moving to next chunk
        let cachedPromise = Promise.resolve();
        for (let j = 1; j < chunks.length; j += 1) {
          cachedPromise = cachedPromise
            .then(() => dispatch(
              preloadGoogleTTSAsync(textToSpeechLang, chunks[j], j, chunks.length),
            ));
        }

        return cF();
      })
      .then(() => {
        cachedResponses = {};
        dispatch({ type: END_TEXT_TO_SPEECH });
      })
      .catch(() => {
        dispatch(openAlert('cannotConnectToServer'));
        dispatch({ type: END_TEXT_TO_SPEECH });
      });
  }
});

export const endTextToSpeech = () => ((dispatch) => {
  window.speechSynthesis.cancel();
  if (player) player.pause();
  dispatch({ type: END_TEXT_TO_SPEECH });
});
