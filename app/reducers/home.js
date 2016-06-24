import {
  TOGGLE_EXPANDED,
  UPDATE_INPUT_TEXT, UPDATE_HOME_MULTIPLE,
} from '../constants/actions';

const initialState = {
  inputExpanded: false,
  status: 'none',
  inputText: '',
  outputText: null,
  inputRoman: null,
  outputRoman: null,
  outputSegments: null,
  detectedInputLang: null,
  inputDict: null,
  outputDict: null,
  suggestedInputLang: null,
  suggestedInputText: null,
  imeMode: null,
};

const home = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_EXPANDED:
      return Object.assign({}, state, {
        inputExpanded: !state.inputExpanded,
      });
    case UPDATE_INPUT_TEXT:
      return Object.assign({}, state, {
        inputText: action.inputText,
      });
    case UPDATE_HOME_MULTIPLE:
      return Object.assign({}, state, action.newValue);
    default:
      return state;
  }
};

export default home;
