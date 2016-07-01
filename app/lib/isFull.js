/* global Windows */

const currentApp = Windows.ApplicationModel.Store.CurrentApp;

const isFull = () => !currentApp.licenseInformation.isTrial;

export default isFull;
