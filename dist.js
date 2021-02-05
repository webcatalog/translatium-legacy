/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs-extra');
const builder = require('electron-builder');
const glob = require('glob');
const del = require('del');
const semver = require('semver');

const packageJson = require('./package.json');
const displayLanguages = require('./main-src/libs/locales/languages');

const { Arch, Platform } = builder;

console.log(`Machine: ${process.platform}`);

const appVersion = fs.readJSONSync(path.join(__dirname, 'package.json')).version;

let targets;
switch (process.platform) {
  case 'darwin': {
    // targets = Platform.MAC.createTarget(['mas'], Arch.universal);
    targets = Platform.MAC.createTarget([process.env.FORCE_DEV ? 'mas-dev' : 'mas'], Arch.universal);
    break;
  }
  case 'win32': {
    targets = Platform.WINDOWS.createTarget(['appx']);
    break;
  }
  default:
  case 'linux': {
    targets = Platform.LINUX.createTarget(['AppImage', 'snap']);
    break;
  }
}

const opts = {
  targets,
  config: {
    asarUnpack: [
      'node_modules/node-mac-permissions/build',
    ],
    appId: 'com.webcatalog.translatium',
    // https://github.com/electron-userland/electron-builder/issues/3730
    buildVersion: process.platform === 'darwin' ? appVersion : undefined,
    productName: 'Translatium',
    files: [
      '!docs/**/*',
      '!popclip/**/*',
      '!test/**/*',
    ],
    directories: {
      buildResources: 'build-resources',
    },
    protocols: {
      name: 'Translatium',
      schemes: ['translatium'],
    },
    appx: {
      identityName: 'WebCatalogLtd.TranslatiumTranslator',
      publisher: 'CN=C2673AF2-2F8A-4FAF-AC59-112BBCFB3423',
      backgroundColor: '#43a047',
      languages: Object.keys(displayLanguages),
      showNameOnTiles: true,
    },
    mac: {
      darkModeSupport: true,
      // https://github.com/electron/electron/issues/15958#issuecomment-447685065
      // alternative solution for app.requestSingleInstanceLock in signed mas builds (Mac App Store)
      extendInfo: {
        LSMultipleInstancesProhibited: true,
      },
      entitlementsLoginHelper: 'build-resources/entitlements.mas.login-helper.plist',
    },
    mas: {
      category: 'public.app-category.travel',
      provisioningProfile: process.env.FORCE_DEV
        ? 'build-resources/embedded-development.provisionprofile' // mas-dev
        : 'build-resources/embedded.provisionprofile',
      darkModeSupport: true,
    },
    linux: {
      category: 'Utility',
      packageCategory: 'utils',
    },
    snap: {
      publish: [
        {
          provider: 'snapStore',
          channels: [semver.prerelease(packageJson.version) ? 'edge' : 'stable'],
        },
        'github',
      ],
    },
    afterPack: ({ appOutDir }) => new Promise((resolve, reject) => {
      const languages = Object.keys(displayLanguages);

      if (process.platform === 'darwin') {
        glob(`${appOutDir}/Translatium.app/Contents/Resources/!(${languages.join('|').replace(/-/g, '_')}).lproj`, (err, files) => {
          console.log('Deleting redundant *.lproj files...');
          if (err) return reject(err);
          return del(files).then(() => {
            files.forEach((file) => {
              console.log('Deleted', path.basename(file));
            });
            resolve();
          }, reject);
        });
      } else {
        resolve();
      }
    }),
  },
};

builder.build(opts)
  .then(() => {
    console.log('build successful');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
