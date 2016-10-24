/* global Windows */

const openUri = (uriStr) => {
  const uri = new Windows.Foundation.Uri(uriStr);
  return Windows.System.Launcher.launchUriAsync(uri);
};

export default openUri;
