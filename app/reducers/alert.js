import { UPDATE_ALERT_MESSAGE } from '../constants/actions';

/* global window */
const initialState = {
  message: null,
};

const alert = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ALERT_MESSAGE:
      return Object.assign({}, state, {
        message: action.message,
      });
    default:
      return state;
  }
};

export default alert;
