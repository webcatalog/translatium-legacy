/* global Windows remote */
import getPlatform from './getPlatform';

const copyToClipboard = (text) => {
  switch (getPlatform()) {
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

export default copyToClipboard;
