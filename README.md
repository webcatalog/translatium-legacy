<img src="build-resources/icon.png" height="128" width="128" alt="Modern Translator" />

## Modern Translator Desktop
[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/modern-translator/desktop/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/modern-translator/modern-translator.svg?branch=master)](https://travis-ci.org/modern-translator/modern-translator)

Available on [Windows Store](https://www.microsoft.com/store/apps/9wzdncrcsg9k?cid=github) & [Mac App Store](https://itunes.apple.com/us/app/modern-translator/id1176624652).


## Development Guide
### macOS
**Requirements**
1. Xcode (latest).
2. Node.js 8.

**Development**
`yarn electron-dev`

**Release**
`yarn dist`

---

### Windows 10
**Requirements**
1. Visual Studio 2017.
2. Node.js 8.

**Development**
1. `yarn build`
2. Open `windows.sln` with Visual Studio and run the project.

**Release**
1. `yarn build`
2. Open `windows.sln` with Visual Studio and build the project.
