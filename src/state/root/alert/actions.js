import { UPDATE_ALERT_MESSAGE } from '../../../constants/actions';

export const closeAlert = () => ({
  type: UPDATE_ALERT_MESSAGE,
  message: null,
});

export const openAlert = (message) => ({
  type: UPDATE_ALERT_MESSAGE,
  message,
});
