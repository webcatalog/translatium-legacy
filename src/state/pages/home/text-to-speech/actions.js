import { START_TEXT_TO_SPEECH, END_TEXT_TO_SPEECH } from '../../../../constants/actions';

export const startTextToSpeech = (textToSpeechLang, textToSpeechText) => ((dispatch) => {
  if (textToSpeechText.length < 1) return;

  dispatch({ type: START_TEXT_TO_SPEECH, textToSpeechLang, textToSpeechText });

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

  const utterThis = new window.SpeechSynthesisUtterance(textToSpeechText);
  utterThis.voice = voice;
  window.speechSynthesis.speak(utterThis);

  dispatch({ type: START_TEXT_TO_SPEECH });

  utterThis.onend = () => {
    dispatch({ type: END_TEXT_TO_SPEECH });
  };
});

export const endTextToSpeech = () => ((dispatch) => {
  window.speechSynthesis.cancel();
  dispatch({ type: END_TEXT_TO_SPEECH });
});
