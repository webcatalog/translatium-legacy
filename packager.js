/* eslint-disable no-console */

const builder = require('electron-builder');
const glob = require('glob');
const del = require('del');

const electronVersion = require('./package.json').devDependencies.electron;
const displayLanguages = require('./src/constants/display-languages').default;

const { Platform, Arch } = builder;

console.log(`Packaging for ${process.platform}`);

const productName = 'Translatium';

let targets;

switch (process.platform) {
  case 'darwin': {
    targets = Platform.MAC.createTarget(['mas-dev', 'mas']);
    break;
  }
  case 'win32': {
    targets = Platform.WINDOWS.createTarget(['dir', 'appx']);
    break;
  }
  default:
  case 'linux': {
    targets = Platform.LINUX.createTarget(['dir', 'snap'], Arch.x64);
    break;
  }
}

// Promise is returned
builder.build({
  targets,
  config: {
    electronVersion,
    appId: 'com.moderntranslator.app',
    productName,
    files: [
      '!docs/**/*',
      '!popclip/**/*',
    ],
    directories: {
      buildResources: 'build-resources',
    },
    protocols: {
      name: 'Translatium',
      schemes: ['translatium'],
    },
    afterPack: ({ appOutDir }) => new Promise((resolve, reject) => {
      console.log('afterPack', appOutDir, process.platform);

      const languages = Object.keys(displayLanguages);

      if (process.platform === 'darwin') {
        glob(`${appOutDir}/${productName}.app/Contents/Resources/!(${languages.join('|')}).lproj`, (err, files) => {
          console.log(files);
          if (err) return reject(err);
          return del(files).then(resolve, reject);
        });
      } else {
        resolve();
      }
    }),
  },
})
  .then(() => {
    console.log('build successful');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
