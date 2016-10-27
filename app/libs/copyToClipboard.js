/* global Windows remote */

const copyToClipboard = (text) => {
  switch (process.env.PLATFORM) {
    case 'windows': {
      const dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
      dataPackage.setText(text);
      Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
      return;
    }
    case 'mac': {
      remote.clipboard.writeText(text);
      return;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support copyToClipboard.');
      /* eslint-enable no-console */
    }
  }
};

copyToClipboard('YEAH');

export default copyToClipboard;
