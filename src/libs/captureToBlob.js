const captureToBlob = () =>
  new Promise((resolve, reject) => {
    try {
      switch (process.env.PLATFORM) {
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
          /* global Camera navigator Blob resolveLocalFileSystemURL FileReader */

          // capture callback
          const captureSuccess = (filePath) => {
            resolveLocalFileSystemURL(filePath, (fileEntry) => {
              fileEntry.file((xFile) => {
                const reader = new FileReader();

                reader.onloadend = function onReadEnd() {
                  const blob = new Blob([this.result], { type: 'image/jpeg' });

                  resolve({
                    fileName: 'image.jpg',
                    blob,
                  });
                };

                reader.readAsArrayBuffer(xFile);
              },
              (err) => {
                reject(err);
              });
            });
          };

          // capture error callback
          const captureError = (err) => {
            if (err.code === 3) {
              resolve();
              return;
            }
            reject(err);
          };

          navigator.camera.getPicture(captureSuccess, captureError, {
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            destinationType: Camera.DestinationType.FILE_URI,
          });
          break;
        }
        default:
        case 'mac': {
          /* eslint-disable no-console */
          console.log('Platform does not support camera capture');
          /* eslint-enable no-console */
        }
      }
    } catch (err) {
      reject(err);
    }
  });

export default captureToBlob;
