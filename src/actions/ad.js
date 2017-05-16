import { UPDATE_SHOULD_SHOW_AD } from '../constants/actions';

export const updateShouldShowAd = shouldShowAd => ({
  type: UPDATE_SHOULD_SHOW_AD,
  shouldShowAd,
});
