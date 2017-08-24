import {
  UPDATE_OCR,
} from '../../../constants/actions';

const initialState = null;

const ocr = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_OCR:
      return action.ocr;
    default:
      return state;
  }
};

export default ocr;
