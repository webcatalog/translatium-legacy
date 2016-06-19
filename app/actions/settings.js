import {
  UPDATE_SETTING,
} from '../constants/actions';

export const updateSetting = (name, value) => ({
  type: UPDATE_SETTING,
  name, value,
});
