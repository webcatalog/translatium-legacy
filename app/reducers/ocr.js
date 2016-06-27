import { UPDATE_OCR_MULTIPLE, TOGGLE_SHOW_ORIGINAL } from '../constants/actions';

const initialState = {
  ocrStatus: null,
  imgHeight: null,
  imgWidth: null,
  ratio: null,
  originalText: null,
  originalSegments: null,
  translatedText: null,
  translatedSegments: null,
  ocrFile: null,
  showOriginal: false,
};

const screen = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_SHOW_ORIGINAL:
      return Object.assign({}, state, {
        showOriginal: !state.showOriginal,
      });
    case UPDATE_OCR_MULTIPLE:
      return Object.assign({}, state, action.newValue);
    default:
      return state;
  }
};

export default screen;
