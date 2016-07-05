/* global Windows */

const currentApp = Windows.ApplicationModel.Store.CurrentAppSimulator;

//const isFull = () => !currentApp.licenseInformation.isTrial;

const isFull = () => true;

export default isFull;
