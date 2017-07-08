/* global Windows */
import getPlatform from './getPlatform';

const shareText = (text) => {
  switch (getPlatform()) {
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
    case 'cordova': {
      const options = {
        message: text,
      };

      const onSuccess = (result) => {
        // eslint-disable-next-line
        console.log('Share completed?', result.completed); // On Android apps mostly return false even while it's true
        // eslint-disable-next-line
        console.log('Shared to app:', result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      };

      const onError = (msg) => {
        // eslint-disable-next-line
        console.log('Sharing failed with message: ', msg);
      };

      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);

      break;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support shareText.');
      /* eslint-enable no-console */
    }
  }
};

export default shareText;
