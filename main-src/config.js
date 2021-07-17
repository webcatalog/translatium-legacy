/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const path = require('path');

const APP_NAME = 'Translatium';
const APP_TEAM = 'WebCatalog Ltd';
const APP_URL = 'https://webcatalog.io/translatium/';

const IMAGE_PATH = path.join(__dirname, '..', 'images');

module.exports = {
  APP_NAME,
  APP_TEAM,
  APP_COPYRIGHT: `Copyright © 2014 - ${new Date().getFullYear()} ${APP_TEAM}`,
  IMAGE_PATH,
  MACOS_APP_ICON: path.join(IMAGE_PATH, 'icon.icns'),
  APP_URL,
};
