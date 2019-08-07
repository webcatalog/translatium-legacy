import { START_TEXT_TO_SPEECH, END_TEXT_TO_SPEECH } from '../../../../constants/actions';

const initialState = {
  textToSpeechLang: null,
  textToSpeechText: null,
  textToSpeechPlaying: false,
};

const textToSpeech = (state = initialState, action) => {
  switch (action.type) {
    case START_TEXT_TO_SPEECH:
      return Object.assign({}, state, {
        textToSpeechLang: action.textToSpeechLang,
        textToSpeechText: action.textToSpeechText,
        textToSpeechPlaying: true,
      });
    case END_TEXT_TO_SPEECH:
      return Object.assign({}, state, {
        textToSpeechLang: null,
        textToSpeechText: null,
        textToSpeechPlaying: false,
      });
    default:
      return state;
  }
};

export default textToSpeech;
