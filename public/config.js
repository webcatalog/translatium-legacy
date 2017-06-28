const path = require('path');

const APP_NAME = 'Modern Translator';
const APP_TEAM = 'Quang Lam';
const APP_URL = 'https://moderntranslator.com';

const IMAGE_PATH = path.join(__dirname, '..', 'images');

module.exports = {
  APP_NAME,
  APP_TEAM,
  APP_COPYRIGHT: `Copyright © 2014 - ${new Date().getFullYear()} ${APP_TEAM}`,
  IMAGE_PATH,
  MACOS_APP_ICON: path.join(IMAGE_PATH, 'icon.icns'),

  SUPPORT_EMAIL: 'support@moderntranslator.com',
  APP_URL,
};
