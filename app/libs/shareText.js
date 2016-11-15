/* global Windows */

const shareText = (text) => {
  switch (process.env.PLATFORM) {
    case 'windows': {
      const dataTransferManager =
        Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
      dataTransferManager.ondatarequested = (e) => {
        const request = e.request;
        request.data.properties.title = '\0';
        request.data.properties.description = '\0';
        request.data.setText(text);
        dataTransferManager.ondatarequested = null;
      };
      Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
      break;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support copyToClipboard.');
      /* eslint-enable no-console */
    }
  }
};

export default shareText;
