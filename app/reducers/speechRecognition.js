import { UPDATE_SPEECH_RECOGNITION_STATUS } from '../constants/actions';

const initialState = {
  status: 'none',
};

const speechRecognition = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SPEECH_RECOGNITION_STATUS:
      return Object.assign({}, state, {
        status: action.status,
      });
    default:
      return state;
  }
};

export default speechRecognition;
