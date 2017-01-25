/* global Windows */

const isTrial = () => {
  if (process.env.PLATFORM !== 'windows') return false;

  const currentApp = process.env.NODE_ENV === 'production'
                   ? Windows.ApplicationModel.Store.CurrentApp
                   : Windows.ApplicationModel.Store.CurrentAppSimulator;
  return currentApp.licenseInformation.isTrial;
};

export default isTrial;
