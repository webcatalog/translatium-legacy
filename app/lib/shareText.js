/* global Windows */

const shareText = (text) => {
  const dataTransferManager =
    Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
  dataTransferManager.ondatarequested = e => {
    const request = e.request;
    request.data.properties.title = '\0';
    request.data.properties.description = '\0';
    request.data.setText(text);
    dataTransferManager.ondatarequested = null;
  };
  Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
};

export default shareText;
