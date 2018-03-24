const path = require('path');

const APP_NAME = 'Translatium';
const APP_TEAM = 'Quang Lam';
const APP_URL = 'https://quanglam2807.github.io/translatium';

const IMAGE_PATH = path.join(__dirname, '..', 'images');

module.exports = {
  APP_NAME,
  APP_TEAM,
  APP_COPYRIGHT: `Copyright © 2014 - ${new Date().getFullYear()} ${APP_TEAM}`,
  IMAGE_PATH,
  MACOS_APP_ICON: path.join(IMAGE_PATH, 'icon.icns'),
  APP_URL,
};
