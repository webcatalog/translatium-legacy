const getFileType = (ext) => {
  switch (ext) {
    case 'png':
      return 'image/png';
    default:
      return 'image/jpeg';
  }
};

const openFileToBlob = () =>
  new Promise((resolve, reject) => {
    switch (process.env.PLATFORM) {
      case 'windows': {
        /* global Windows window */
        const picker = new Windows.Storage.Pickers.FileOpenPicker();
        picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        picker.fileTypeFilter.append('.jpg');
        picker.fileTypeFilter.append('.jpeg');
        picker.fileTypeFilter.append('.png');
        picker.pickSingleFileAsync()
          .then((file) => {
            if (!file) {
              resolve(null);
              return null;
            }
            return file.openAsync(Windows.Storage.FileAccessMode.read)
              .then((stream) => {
                const blob = window.MSApp.createBlobFromRandomAccessStream(
                  getFileType(file.fileType.substring(1)), stream
                );
                resolve(blob);
              });
          })
          .then(null, (err) => {
            reject(err);
          });
        break;
      }
      default:
      case 'mac': {
        /* global remote fs Blob */
        remote.dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] },
          ],
        }, (filePaths) => {
          if (filePaths) {
            const filePath = filePaths[0];
            fs.readFile(filePath, (err, data) => {
              if (err) {
                reject(err);
                return;
              }
              const blob = new Blob([data], { type: getFileType(filePath.split('.').pop()) });
              resolve(blob);
            });
          } else {
            resolve(null);
            return;
          }
        });
      }
    }
  });

export default openFileToBlob;
