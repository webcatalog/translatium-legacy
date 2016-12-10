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
          /* global Camera navigator Blob resolveLocalFileSystemURL loadImage */

          // capture callback
          const captureSuccess = (filePath) => {
            resolveLocalFileSystemURL(filePath, (fileEntry) => {
              fileEntry.file((xFile) => {
                console.log(xFile);
                loadImage(
                  xFile,
                  (canvas) => {
                    console.log(canvas);
                    canvas.toBlob((blob) => {
                      resolve({
                        blob,
                        fileName: 'image.jpg',
                      });
                    }, 'image/jpeg', 50);
                  },
                  {
                    canvas: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                  },
               );
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
