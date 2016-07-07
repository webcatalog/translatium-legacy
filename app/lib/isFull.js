/* global Windows */

const isFull = () => {
  if (process.env.APP_PROFILE === 'lite') return false;

  return Windows.ApplicationModel.Store.CurrentApp.licenseInformation.isTrial === false;
};

export default isFull;
