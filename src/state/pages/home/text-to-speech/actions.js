import { START_TEXT_TO_SPEECH, END_TEXT_TO_SPEECH } from '../../../../constants/actions';
import { ttsWithGoogleAsync } from '../../../../senders';
import { openAlert } from '../../../root/alert/actions';

let player = null;
let currentTimestamp;

const ttsShortText = (lang, text) => ttsWithGoogleAsync(text, lang, 1)
  .then((uri) => new Promise((resolve, reject) => {
    try {
      /* global Audio */
      if (process.env.REACT_APP_GOOGLE_ENDPOINT) {
        player = new Audio(uri.replace('https://translate.google.com', process.env.REACT_APP_GOOGLE_ENDPOINT));
      } else {
        player = new Audio(uri);
      }
      player.play();
      player.onended = () => resolve();
      player.onerror = (e) => reject(e);
    } catch (err) {
      reject(err);
    }
  }));

export const startTextToSpeech = (textToSpeechLang, textToSpeechText) => ((dispatch) => {
  if (textToSpeechText.length < 1) return;

  if (player) player.pause();

  const voices = window.speechSynthesis.getVoices();

  let voice;
  for (let i = 0; i < voices.length; i += 1) {
    // special case for Chinese
    if (textToSpeechLang === 'zh') {
      if (voices[i].lang === 'zh-CN') {
        voice = voices[i];
        break;
      }
    } else if (voices[i].lang.startsWith(textToSpeechLang)) {
      voice = voices[i];
      break;
    }
  }

  if (voice) {
    dispatch({ type: START_TEXT_TO_SPEECH, textToSpeechLang, textToSpeechText });

    const utterThis = new window.SpeechSynthesisUtterance(textToSpeechText);
    utterThis.voice = voice;
    utterThis.onend = () => {
      dispatch({ type: END_TEXT_TO_SPEECH });
    };

    window.speechSynthesis.speak(utterThis);

    dispatch({ type: START_TEXT_TO_SPEECH });
  } else {
    currentTimestamp = Date.now();
    const timestamp = currentTimestamp;

    Promise.resolve()
      .then(() => {
        const strArr = [];
        let t = textToSpeechText;
        while (t.length > 0) {
          let stext;
          if (t.length > 200) { // maximum 200 characters
            const tmp = t.substr(0, 199);
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

          return ttsShortText(textToSpeechLang, strArr[i])
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
        dispatch({ type: START_TEXT_TO_SPEECH });
      })
      .catch((e) => {
        // eslint-disable-next-line
        console.log(e);
        dispatch({ type: END_TEXT_TO_SPEECH });
        dispatch(openAlert('cannotConnectToServer'));
      });
  }
});

export const endTextToSpeech = () => ((dispatch) => {
  window.speechSynthesis.cancel();
  if (player) player.pause();
  currentTimestamp = null;
  dispatch({ type: END_TEXT_TO_SPEECH });
});
