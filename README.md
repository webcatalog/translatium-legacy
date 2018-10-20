# Translatium [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0) [![Travis Build Status](https://travis-ci.org/translatium/translatium.svg?branch=master)](https://travis-ci.org/translatium/translatium)  

#### Homepage: https://translatiumapp.com

> Old Git history prior to March 2018 is squashed. You can still find it [here](https://github.com/translatium/translatium/tree/02-2018) & [here](https://github.com/translatium/translatium/tree/legacy).

## Development Guide
### macOS
**Requirements**
1. Xcode (latest).
2. Node.js 8+.

Run `yarn` to install dependencies.

**Development**
`yarn electron-dev`

**Release**
`yarn dist-electron`

---

### Windows 10
**Requirements**
1. Visual Studio 2017.
2. Node.js 8+.

Run `yarn` to install dependencies.

**Development**
1. `yarn build`
2. Open `windows.sln` with Visual Studio and run the project.

**Release**
1. `yarn build`
2. Open `windows.sln` with Visual Studio and build the project.
