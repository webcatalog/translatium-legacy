const takeScreenshotToBlob = () => {
  const { desktopCapturer, remote } = window.require('electron');

  // https://github.com/karaggeorge/mac-screen-capture-permissions/tree/master
  // https://nyrra33.com/2019/07/23/open-preference-pane-programmatically/
  const permissionStatus = remote.systemPreferences.getMediaAccessStatus('screen');
  if (permissionStatus !== 'granted') {
    if (window.process.platform === 'darwin') {
      remote.shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      remote.getCurrentWindow().on('hide', () => {
        resolve();
      });
      remote.getCurrentWindow().hide();
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
          remote.getCurrentWindow().show();
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
      remote.getCurrentWindow().show();
      return result;
    })
    .catch((err) => {
      remote.getCurrentWindow().show();
      // eslint-disable-next-line no-console
      console.log(err);
      return null;
    });
};

export default takeScreenshotToBlob;
