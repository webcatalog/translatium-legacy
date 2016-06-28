/* global Windows */

const copyToClipboard = (text) => {
  const dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
  dataPackage.setText(text);
  Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
};

export default copyToClipboard;
