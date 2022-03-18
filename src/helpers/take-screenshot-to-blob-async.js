/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import {
  getCurrentWindow,
  desktopCapturer,
  require as remoteRequire,
} from '@electron/remote';

const takeScreenshotToBlob = () => {
  // use node-mac-permissions
  // as Electron API doesn't support askForScreenCaptureAccess()
  // shell.openExternal('x-apple.systempreferences...') is not sufficient as it doesn't ensure
  // the app is added to app list in system pref
  if (window.process.platform === 'darwin') {
    const permissions = remoteRequire('node-mac-permissions');
    const authStatus = permissions.getAuthStatus('screen');
    if (authStatus === 'denied' || authStatus === 'restricted') {
      permissions.askForScreenCaptureAccess();
      return Promise.resolve();
    }
  }

  return new Promise((resolve, reject) => {
    try {
      getCurrentWindow().on('hide', () => {
        resolve();
      });
      getCurrentWindow().hide();
    } catch (err) {
      reject(err);
    }
  })
    .then(() => desktopCapturer.getSources({ types: ['screen'] }))
    .then(async (sources) => {
      const source = sources[0];
      const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // https://stackoverflow.com/questions/27420581/get-maximum-video-resolution-with-getusermedia
          optional: [
            { minWidth: 320 },
            { minWidth: 640 },
            { minWidth: 800 },
            { minWidth: 900 },
            { minWidth: 1024 },
            { minWidth: 1280 },
            { minWidth: 1920 },
            { minWidth: 2560 },
          ],
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
          },
        },
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new window.ImageCapture(track);
      // imageCapture.takeScreenshot has bug
      // https://github.com/GoogleChromeLabs/imagecapture-polyfill/issues/15
      // so use grabFrame instead
      return imageCapture.grabFrame()
        .then((img) => {
          getCurrentWindow().show();
          const canvas = window.document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width - img.width * ratio) / 2;
          const y = (canvas.height - img.height * ratio) / 2;
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
            x, y, img.width * ratio, img.height * ratio);
          return new Promise((resolve, reject) => {
            try {
              canvas.toBlob((blob) => { resolve({ blob, fileName: 'screenshot.png' }); }, 'image/png');
            } catch (err) {
              reject(err);
            }
          });
        });
    })
    .then((result) => {
      getCurrentWindow().show();
      return result;
    })
    .catch((err) => {
      getCurrentWindow().show();
      // eslint-disable-next-line no-console
      console.log(err);
      return null;
    });
};

export default takeScreenshotToBlob;
