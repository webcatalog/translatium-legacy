import getPlatform from './getPlatform';
import b64ToBlob from './b64ToBlob';

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
                    'image/jpeg', stream,
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
        case 'cordova': {
          const cameraSuccess = (b64Data) => {
            const blob = b64ToBlob(b64Data, 'image/jpeg');
            resolve({
              fileName: 'image.jpg',
              blob,
            });
          };

          // capture error callback
          const cameraError = e => reject(e);

          const cameraOptions = {
            destinationType: 0, // Camera.DestinationType.DATA_URL
            encodingType: 0, // Camera.EncodingType.JPEG
            sourceType: 1, // Camera.PictureSourceType.CAMERA
            targetWidth: 1280,
            targetHeight: 720,
          };

          window.navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);

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
