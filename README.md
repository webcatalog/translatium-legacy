<img src="build-resources/icons/1024x1024.png" height="128" width="128" alt="Translatium" />

## Translatium

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

| Platform    | Build Status                                                                                                                                                                                                                    |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| macOS | [![Travis Build Status](https://travis-ci.org/translatium/translatium.svg?branch=master)](https://travis-ci.org/translatium/translatium)                                                                |
| Windows | [![VSO Build Status](https://img.shields.io/vso/build/quanglam2807/2f76e0e3-6c4c-4c04-a98e-f7c1460efa1c/2.svg)](https://quanglam2807.visualstudio.com/Modern%20Translator/_build/index?definitionId=2) |

#### Homepage: https://translatiumapp.com

## Development Guide
### macOS
**Requirements**
1. Xcode (latest).
2. Node.js 8.

**Development**
`yarn electron-dev`

**Release**
`yarn dist-electron`

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
