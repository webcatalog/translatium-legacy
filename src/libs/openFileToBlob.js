import getPlatform from './getPlatform';

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
    switch (getPlatform()) {
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
                const fileExt = file.fileType.substring(1);
                const blob = window.MSApp.createBlobFromRandomAccessStream(
                  getFileType(fileExt), stream,
                );
                resolve({
                  fileName: `image.${fileExt}`,
                  blob,
                });
              });
          })
          .then(null, (err) => {
            reject(err);
          });
        break;
      }
      default:
      case 'electron': {
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

              const fileExt = filePath.split('.').pop();

              const blob = new Blob([data], { type: getFileType(fileExt) });

              resolve({
                fileName: `image.${fileExt}`,
                blob,
              });
            });
          } else {
            resolve(null);
          }
        });
      }
    }
  });

export default openFileToBlob;
