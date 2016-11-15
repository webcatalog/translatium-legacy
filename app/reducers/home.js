import {
  UPDATE_INPUT_TEXT, UPDATE_OUTPUT, UPDATE_IME_MODE, TOGGLE_FULLSCREEN_INPUT_BOX,
} from '../constants/actions';

const initialState = {
  inputText: '',
  selectionStart: 0,
  selectionEnd: 0,
  output: null,
  fullscreenInputBox: false,
};


const home = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_FULLSCREEN_INPUT_BOX:
      return Object.assign({}, state, {
        fullscreenInputBox: !state.fullscreenInputBox,
      });
    case UPDATE_IME_MODE:
      return Object.assign({}, state, {
        imeMode: action.imeMode,
      });
    case UPDATE_OUTPUT: {
      return Object.assign({}, state, {
        output: action.output,
      });
    }
    case UPDATE_INPUT_TEXT:
      return Object.assign({}, state, {
        inputText: action.inputText,
        selectionStart: action.selectionStart,
        selectionEnd: action.selectionEnd,
      });
    default:
      return state;
  }
};

export default home;
