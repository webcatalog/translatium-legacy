/* global Windows */

const isTrial = () => {
  if (process.env.PLATFORM !== 'windows') return false;

  const currentApp = Windows.ApplicationModel.Store.CurrentApp;
  return currentApp.licenseInformation.isTrial;
};

export default isTrial;
