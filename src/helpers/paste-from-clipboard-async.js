/* global Windows remote */
import getPlatform from './get-platform';

const pasteFromClipboardAsync = () =>
  Promise.resolve()
    .then(() => {
      switch (getPlatform()) {
        case 'windows': {
          return new Promise((resolve, reject) => {
            const dataPackageView = Windows.ApplicationModel.DataTransfer.Clipboard.getContent();
            if (dataPackageView
              .contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
              // UWP Promise type
              dataPackageView.getTextAsync()
                .then((text) => {
                  resolve(text);
                })
                .then(null, (err) => {
                  reject(err);
                });
            }
          });
        }
        case 'electron': {
          return remote.clipboard.readText();
        }
        default: {
          return '';
        }
      }
    });

export default pasteFromClipboardAsync;
