/* eslint-disable no-console */

const builder = require('electron-builder');
const glob = require('glob');
const del = require('del');

const electronVersion = require('./package.json').devDependencies.electron.substr(1);
const displayLanguages = require('./src/constants/displayLanguages').default;

const { Platform, Arch } = builder;

console.log(`Packaging for ${process.platform}`);

let targets;
switch (process.platform) {
  case 'darwin': {
    targets = Platform.MAC.createTarget(['mas']);
    break;
  }
  case 'linux': {
    targets = Platform.LINUX.createTarget(['deb', 'rpm', 'pacman'], Arch.x64);
    break;
  }
  case 'win32':
  default: {
    targets = Platform.WINDOWS.createTarget(['squirrel', 'nsis'], Arch.x64);
  }
}

const productName = 'Modern Translator';

// Promise is returned
builder.build({
  targets,
  config: {
    electronVersion,
    appId: 'com.moderntranslator.app',
    productName,
    directories: {
      buildResources: 'build-resources',
    },
    linux: {
      category: 'Education',
      packageCategory: 'education',
      target: [
        'deb',
        'rpm',
        'pacman',
      ],
    },
    afterPack: ({ appOutDir }) =>
      new Promise((resolve, reject) => {
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
