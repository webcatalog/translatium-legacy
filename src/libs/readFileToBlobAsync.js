import getPlatform from './getPlatform';

const readFileToBlobAsync = (filePath) => {
  if (getPlatform() !== 'cordova') {
    return Promise.reject(new Error('Platform is not supported.'));
  }

  return new Promise((resolve, reject) => {
    window.resolveLocalFileSystemURL(filePath, (fileEntry) => {
      fileEntry.file((file) => {
        /* global FileReader Blob */
        const reader = new FileReader();
        reader.onloadend = () => {
          const blob = new Blob([new Uint8Array(this.result)]);
          resolve(blob);
        };

        reader.readAsArrayBuffer(file);
      }, e => reject(e));
    }, e => reject(e));
  });
};

export default readFileToBlobAsync;
