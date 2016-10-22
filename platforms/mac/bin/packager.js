#!/usr/bin/env node

/**
*
* Builds app binaries for Mac, Linux, and Windows.
*/

/* eslint-disable no-console */

const electronPackager = require('electron-packager');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const rimraf = require('rimraf');
const sign = require('electron-osx-sign');

const config = require('../src/config');

const BUILD_PATH = path.join(config.ROOT_PATH, 'build');
const DIST_PATH = path.join(config.ROOT_PATH, 'dist');

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'sign',
  ],
  default: {
    package: 'all',
    sign: false,
  },
  string: [
    'package',
  ],
});

function printDone(err) {
  if (err) console.error(err.message || err);
}

/*
 * Print a large warning when signing is disabled so we are less likely to accidentally
 * ship unsigned binaries to users.
 */
function printWarning() {
  console.log(fs.readFileSync(path.join(__dirname, 'warning.txt'), 'utf8'));
}


const all = {
  // The human-readable copyright line for the app. Maps to the `LegalCopyright` metadata
  // property on Windows, and `NSHumanReadableCopyright` on Mac.
  'app-copyright': config.APP_COPYRIGHT,

  // The release version of the application. Maps to the `ProductVersion` metadata
  // property on Windows, and `CFBundleShortVersionString` on Mac.
  'app-version': config.APP_VERSION,

  // Package the application's source code into an archive, using Electron's archive
  // format. Mitigates issues around long path names on Windows and slightly speeds up
  // require().
  asar: {
    // A glob expression, that unpacks the files with matching names to the
    // "app.asar.unpacked" directory.
    unpack: 'WebCatalog*',
  },

  // The build version of the application. Maps to the FileVersion metadata property on
  // Windows, and CFBundleVersion on Mac. Note: Windows requires the build version to
  // start with a number. We're using the version of the underlying WebCatalog library.
  'build-version': config.APP_VERSION,

  // The application source directory.
  dir: config.ROOT_PATH,

  // Pattern which specifies which files to ignore when copying files to create the
  // package(s).
  /* eslint-disable max-len */
  ignore: /^\/src\/renderer|^\/dist|\/(appveyor.yml|\.appveyor.yml|\.github|appdmg|AUTHORS|CONTRIBUTORS|bench|benchmark|benchmark\.js|bin|bower\.json|component\.json|coverage|doc|docs|docs\.mli|dragdrop\.min\.js|example|examples|example\.html|example\.js|externs|ipaddr\.min\.js|Makefile|min|minimist|perf|rusha|simplepeer\.min\.js|simplewebsocket\.min\.js|static\/screenshot\.png|test|tests|test\.js|tests\.js|webtorrent\.min\.js|\.[^\/]*|.*\.md|.*\.markdown)$/,
  /* eslint-enable max-len */

  // The application name.
  name: config.APP_NAME,

  // The base directory where the finished package(s) are created.
  out: DIST_PATH,

  // Replace an already existing output directory.
  overwrite: true,

  // Runs `npm prune --production` which remove the packages specified in
  // "devDependencies" before starting to package the app.
  prune: true,
};

const darwin = {
  // Build for Mac
  platform: 'darwin',

  // Build x64 binaries only.
  arch: 'x64',

  // The bundle identifier to use in the application's plist (Mac only).
  'app-bundle-id': 'com.webcatalog.app',

  // The application category type, as shown in the Finder via "View" -> "Arrange by
  // Application Category" when viewing the Applications directory (Mac only).
  'app-category-type': 'public.app-category.utilities',

  // The bundle identifie to use in the application helper's plist (Mac only).
  'helper-bundle-id': 'com.webcatalog.app-helper',

  // Application icon.
  icon: config.MACOS_APP_ICON,
};

function buildDarwin(gCb) {
  console.log('Mac: Packaging electron...');
  electronPackager(Object.assign({}, all, darwin), (err, buildPath) => {
    if (err) return gCb(err);
    console.log(`Mac: Packaged electron. ${buildPath}`);

    const appPath = path.join(buildPath[0], `${config.APP_NAME}.app`);

    function signApp(cb) {
      /*
       * Sign the app with Apple Developer ID certificates. We sign the app for 2 reasons:
       *   - So the auto-updater (Squirrrel.Mac) can check that app updates are signed by
       *     the same author as the current version.
       *   - So users will not a see a warning about the app coming from an "Unidentified
       *     Developer" when they open it for the first time (Mac Gatekeeper).
       *
       * To sign an Mac app for distribution outside the App Store, the following are
       * required:
       *   - Xcode
       *   - Xcode Command Line Tools (xcode-select --install)
       *   - Membership in the Apple Developer Program
       */
      const signOpts = {
        app: appPath,
        platform: 'darwin',
        verbose: true,
      };

      console.log('Mac: Signing app...');
      sign(signOpts, (err2) => {
        if (err2) return cb(err2);
        console.log('Mac: Signed app.');
        cb(null);
        return null;
      });
    }

    if (process.platform === 'darwin') {
      if (argv.sign) {
        signApp((signErr) => {
          if (signErr) gCb(signErr);
        });
      } else {
        printWarning();
      }
    } else {
      printWarning();
    }

    return null;
  });
}

function build() {
  rimraf.sync(DIST_PATH);
  rimraf.sync(BUILD_PATH);

  // console.log('Build: Transpiling to ES5...');
  // cp.execSync('npm run build', { NODE_ENV: 'production', stdio: 'inherit' });
  // console.log('Build: Transpiled to ES5.');

  // const platform = argv._[0]
  buildDarwin(printDone);
}

build();
