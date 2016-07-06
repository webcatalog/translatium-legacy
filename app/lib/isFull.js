/* global Windows */

const currentApp = Windows.ApplicationModel.Store.CurrentApp;

const isFull = () => !currentApp.licenseInformation.isTrial;

// const isFull = () => true;

export default isFull;
