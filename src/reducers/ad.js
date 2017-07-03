/* global Windows */

import { UPDATE_SHOULD_SHOW_AD } from '../constants/actions';

import getPlatform from '../libs/getPlatform';

let shouldShowAd = false;
if (getPlatform() === 'windows') {
  try {
    const currentApp = process.env.NODE_ENV === 'production' ? Windows.ApplicationModel.Store.CurrentApp
                    : Windows.ApplicationModel.Store.CurrentAppSimulator;

    shouldShowAd = !(currentApp.licenseInformation.productLicenses.lookup('remove.ads.durable').isActive
                || currentApp.licenseInformation.productLicenses.lookup('remove.ads.free').isActive);
  } catch (err) {
    // eslint-disable-next-line
    console.log(err);
  }
}

const initialState = {
  shouldShowAd,
};

const ad = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SHOULD_SHOW_AD:
      return Object.assign({}, state, {
        shouldShowAd: action.shouldShowAd,
      });
    default:
      return state;
  }
};

export default ad;
