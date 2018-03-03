import { UPDATE_SPEECH_STATUS } from '../../../../constants/actions';

const initialState = {
  status: 'none',
};

const speech = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SPEECH_STATUS:
      return Object.assign({}, state, {
        status: action.status,
      });
    default:
      return state;
  }
};

export default speech;
