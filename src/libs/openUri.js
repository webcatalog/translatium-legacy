/* global Windows shell */
import getPlatform from './getPlatform';

const openUri = (uriStr) => {
  switch (getPlatform()) {
    case 'windows': {
      const uri = new Windows.Foundation.Uri(uriStr);
      Windows.System.Launcher.launchUriAsync(uri);
      break;
    }
    case 'mac': {
      shell.openExternal(uriStr);
      break;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support openUri.');
      /* eslint-enable no-console */
    }
  }
};

export default openUri;
