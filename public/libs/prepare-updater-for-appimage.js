const prepareUpdaterforAppImage = (autoUpdater) => {
  // https://github.com/atomery/webcatalog/issues/634
  // HACK(mc, 2019-09-10): work around https://github.com/electron-userland/electron-builder/issues/4046
  if (process.platform === 'linux' && process.env.DESKTOPINTEGRATION === 'AppImageLauncher') {
    // remap temporary running AppImage to actual source
    // THIS IS PROBABLY SUPER BRITTLE AND MAKES ME WANT TO STOP USING APPIMAGE
    autoUpdater.logger.info('AppImageLauncher detected.');
    autoUpdater.logger.info('rewriting $APPIMAGE', {
      oldValue: process.env.APPIMAGE,
      newValue: process.env.ARGV0,
    });
    process.env.APPIMAGE = process.env.ARGV0;
  }
};

module.exports = prepareUpdaterforAppImage;
