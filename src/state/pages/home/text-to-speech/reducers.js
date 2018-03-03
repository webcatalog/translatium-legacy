import { PLAY_TEXT_TO_SPEECH, STOP_TEXT_TO_SPEECH } from '../../../../constants/actions';

const initialState = {
  textToSpeechLang: null,
  textToSpeechText: null,
  textToSpeechPlaying: false,
};

const textToSpeech = (state = initialState, action) => {
  switch (action.type) {
    case PLAY_TEXT_TO_SPEECH:
      return Object.assign({}, state, {
        textToSpeechLang: action.textToSpeechLang,
        textToSpeechText: action.textToSpeechText,
        textToSpeechPlaying: true,
      });
    case STOP_TEXT_TO_SPEECH:
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
