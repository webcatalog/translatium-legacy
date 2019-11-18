# Translatium [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](LICENSE)

|macOS|Linux|Windows|
|---|---|---|
|[![GitHub Actions Build Status](https://github.com/quanglam2807/translatium/workflows/macOS/badge.svg)](https://github.com/quanglam2807/translatium/actions)|[![GitHub Actions Build Status](https://github.com/quanglam2807/translatium/workflows/Linux/badge.svg)](https://github.com/quanglam2807/translatium/actions)|[![Build status](https://github.com/quanglam2807/translatium/workflows/Windows/badge.svg)](https://ci.appveyor.com/project/quanglam2807/translatium)|

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
