/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global Blob */
import { dialog } from '@electron/remote';

const getFileType = (ext) => {
  switch (ext) {
    case 'png':
      return 'image/png';
    default:
      return 'image/jpeg';
  }
};

const openFileToBlobAsync = () => new Promise((resolve, reject) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] },
    ],
  })
    .then(({ filePaths }) => {
      if (Array.isArray(filePaths) && filePaths.length) {
        const filePath = filePaths[0];
        const fs = window.require('fs');
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
    })
    .catch((err) => {
      reject(err);
    });
});

export default openFileToBlobAsync;
