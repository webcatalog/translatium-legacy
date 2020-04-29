# Translatium [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](LICENSE)

|macOS|Linux|Windows|
|---|---|---|
|[![GitHub Actions Build Status](https://github.com/atomery/translatium/workflows/macOS/badge.svg)](https://github.com/atomery/translatium/actions)|[![GitHub Actions Build Status](https://github.com/atomery/translatium/workflows/Linux/badge.svg)](https://github.com/atomery/translatium/actions)|[![GitHub Actions Build Status](https://github.com/atomery/translatium/workflows/Windows/badge.svg)](https://github.com/atomery/translatium/actions)|

**[Translatium](https://translatiumapp.com)** - Translate Any Languages like a Pro.

**master** branch only includes the source code of Translatium 9 & up. For older versions, check out the **legacy-** branches.

---
## Licensing
### Usage
**Translatium is paid software.**  [Pay just $14.99](https://webcatalog.onfastspring.com/translatium) to unlock the app perpetually.

The license:
- Has no time limit and never expires.
- Works with all versions (including major updates).
- Permits uses on all of the devices you own (regardless of platforms or operating systems).

### Source Code
On the other hand, **the source code is freely available** for use, modification and distribution under the permissions, limitations and conditions listed in the [Mozilla Public License 2.0](LICENSE).

---
## Development
```
# First, clone the project:
git clone https://github.com/atomery/translatium.git
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
