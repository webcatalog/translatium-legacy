/* eslint-disable no-console */
const builder = require('electron-builder');

const { Arch, Platform } = builder;

console.log(`Machine: ${process.platform}`);

let targets;
switch (process.platform) {
  case 'darwin': {
    targets = Platform.MAC.createTarget(['mas']);
    break;
  }
  case 'win32': {
    targets = Platform.WINDOWS.createTarget(['appx'], Arch.x64);
    break;
  }
  default:
  case 'linux': {
    targets = Platform.LINUX.createTarget(['snap'], Arch.x64);
    break;
  }
}

const opts = {
  targets,
  config: {
    appId: 'com.moderntranslator.app', // Backward compatibility
    productName: 'Translatium',
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
    mac: {
      category: 'public.app-category.productivity',
    },
    linux: {
      category: 'Utility',
      packageCategory: 'utils',
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
