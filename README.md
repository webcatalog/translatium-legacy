# Translatium [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

|macOS|Linux|Windows|
|---|---|---|
|[![Travis Build Status](https://travis-ci.com/quanglam2807/translatium.svg?branch=master)](https://travis-ci.com/quanglam2807/translatium)|[![Travis Build Status](https://travis-ci.com/quanglam2807/translatium.svg?branch=master)](https://travis-ci.com/quanglam2807/translatium)|[![Build status](https://ci.appveyor.com/api/projects/status/nwbv85xdiq1s69pj?svg=true)](https://ci.appveyor.com/project/quanglam2807/translatium)|

**[Translatium](https://translatiumapp.com)** - Translate Any Languages like a Pro.

**master** branch only includes the source code of Translatium 9 & up. For older versions, check out the **legacy-** branches.

---
## Development
```
# First, clone the project:
git clone https://github.com/quanglam2807/translatium.git
cd translatium

# set API keys
export REACT_APP_YANDEX_TRANSLATE_API_KEY=...
export REACT_APP_YANDEX_DICTIONARY_API_KEY=...
export REACT_APP_OCR_SPACE_API_KEY=...

# install the dependencies
yarn

# Run development mode of Translatium
yarn electron-dev

# Build for production
yarn dist
```
