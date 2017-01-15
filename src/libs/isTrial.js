/* global Windows */

const isTrial = () => {
  if (process.env.PLATFORM !== 'windows') return true;

  const currentApp = Windows.ApplicationModel.Store.CurrentApp;
  return currentApp.licenseInformation.isTrial;
};

export default isTrial;
