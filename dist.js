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
const { notarize } = require('electron-notarize');
const semver = require('semver');
const { exec, spawn } = require('child_process');
const { getSignVendorPath } = require('app-builder-lib/out/codeSign/windowsCodeSign');

const packageJson = require('./package.json');
const displayLanguages = require('./public/libs/locales/languages');

// sometimes, notarization works but *.app does not have a ticket stapled to it
// this ensure the *.app has the notarization ticket
const verifyNotarizationAsync = (filePath) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-console
  console.log(`xcrun stapler validate ${filePath.replace(/ /g, '\\ ')}`);

  exec(`xcrun stapler validate ${filePath.replace(/ /g, '\\ ')}`, (e, stdout, stderr) => {
    if (e instanceof Error) {
      reject(e);
      return;
    }

    if (stderr) {
      reject(new Error(stderr));
      return;
    }

    if (stdout.indexOf('The validate action worked!') > -1) {
      resolve(stdout);
    } else {
      reject(new Error(stdout));
    }
  });
});

// https://stackoverflow.com/a/17466459
const runCmd = (cmd, args, callBack) => {
  const child = spawn(cmd, args);
  let resp = '';

  child.stdout.on('data', (buffer) => { resp += buffer.toString(); });
  child.stdout.on('end', () => { callBack(resp); });
};

const { Arch, Platform } = builder;

console.log(`Machine: ${process.platform}`);

const appVersion = fs.readJSONSync(path.join(__dirname, 'package.json')).version;

let targets;
switch (process.platform) {
  case 'darwin': {
    targets = Platform.MAC.createTarget([process.env.CI ? 'mas' : 'mas-dev'], Arch.x64, Arch.arm64);
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
    appId: 'com.moderntranslator.app', // Backward compatibility
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
      applicationId: 'translatium',
      identityName: '55974nhutquang97.5translate',
      publisher: 'CN=C635F506-DEEB-41A4-8CAA-16689F486ED2',
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
      category: 'public.app-category.productivity',
      provisioningProfile: targets.has(Platform.MAC) && targets.get(Platform.MAC).get(1).indexOf('mas-dev') > -1
        ? 'build-resources/embedded-development.provisionprofile'
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
    afterAllArtifactBuild: () => {
      if (process.platform !== 'win32') {
        return [];
      }
      // Create .appxbundle for backward compability
      // http://www.jonathanantoine.com/2016/04/12/windows-app-bundles-and-the-subsequent-submissions-must-continue-to-contain-a-windows-phone-8-1-appxbundle-error-message/
      // https://docs.microsoft.com/en-us/windows/msix/package/create-app-package-with-makeappx-tool
      // https://github.com/electron-userland/electron-builder/blob/master/packages/app-builder-lib/src/targets/AppxTarget.ts
      const appxBundlePath = path.join('dist', `Translatium ${appVersion}.appxbundle`);
      const appxPath = path.join(__dirname, 'dist', `Translatium ${appVersion}.appx`);
      const bundleDirPath = path.join(__dirname, 'dist', 'appx_bundle');
      const appxDestPath = path.join(bundleDirPath, 'Translatium.appx');
      return getSignVendorPath()
        .then((vendorPath) => {
          console.log(`Creating ${appxBundlePath}...`);
          fs.ensureDirSync(bundleDirPath);
          fs.copyFileSync(appxPath, appxDestPath);
          return new Promise((resolve) => {
            const makeAppxPath = path.join(vendorPath, 'windows-10', 'x64', 'makeappx.exe');
            runCmd(makeAppxPath, ['bundle', '/p', appxBundlePath, '/d', bundleDirPath, '/o'], (text) => {
              console.log(text);
              resolve();
            });
          })
            .then(() => {
              console.log(`Created ${appxBundlePath} successfully`);
              return [appxBundlePath];
            });
        });
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
    afterSign: (context) => {
      // Only notarize app when forced in pull requests or when releasing using tag
      const shouldNotarize = process.platform === 'darwin' && context.electronPlatformName === 'darwin' && process.env.CI_BUILD_TAG;
      if (!shouldNotarize) return null;

      console.log('Notarizing app...');
      // https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
      const { appOutDir } = context;

      const appName = context.packager.appInfo.productFilename;
      const appPath = `${appOutDir}/${appName}.app`;
      return notarize({
        appBundleId: 'com.moderntranslator.app',
        appPath,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
      })
        .then(() => verifyNotarizationAsync(appPath))
        .then((notarizedInfo) => {
          // eslint-disable-next-line no-console
          console.log(notarizedInfo);
        });
    },
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
