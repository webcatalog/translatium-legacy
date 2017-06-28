/* global Windows shell */

const openUri = (uriStr) => {
  switch (process.env.PLATFORM) {
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
