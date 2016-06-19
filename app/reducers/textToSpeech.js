import { PLAY_TTS, STOP_TTS } from '../constants/actions';

const initialState = {
  ttsLang: null,
  ttsText: null,
  ttsPlaying: false,
};

const textToSpeech = (state = initialState, action) => {
  switch (action.type) {
    case PLAY_TTS:
      return Object.assign({}, state, {
        ttsLang: action.ttsLang,
        ttsText: action.ttsText,
        ttsPlaying: true,
      });
    case STOP_TTS:
      return Object.assign({}, state, {
        ttsLang: null,
        ttsText: null,
        ttsPlaying: false,
      });
    default:
      return state;
  }
};

export default textToSpeech;
