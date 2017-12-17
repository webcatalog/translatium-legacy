import getPlatform from './get-platform';

const captureToBlobAsync = () =>
  new Promise((resolve, reject) => {
    try {
      switch (getPlatform()) {
        case 'windows': {
          /* global Windows window */
          const captureUI = new Windows.Media.Capture.CameraCaptureUI();
          captureUI.photoSettings.format = Windows.Media.Capture.CameraCaptureUIPhotoFormat.jpeg;
          captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo)
            .then((file) => {
              if (!file) {
                resolve(null);
                return null;
              }
              return file.openAsync(Windows.Storage.FileAccessMode.read)
                .then((stream) => {
                  const blob = window.MSApp.createBlobFromRandomAccessStream(
                    'image/jpeg',
                    stream,
                  );
                  resolve({
                    fileName: 'image.jpg',
                    blob,
                  });
                });
            })
            .then(null, (err) => {
              reject(err);
            });
          break;
        }
        default: {
          reject(new Error('Platform is not supported.'));
        }
      }
    } catch (err) {
      reject(err);
    }
  });

export default captureToBlobAsync;
