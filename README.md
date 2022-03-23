# Translatium [![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](LICENSE)

## Archived
This repository is archived. To help us better improve the product and protect our intellectual assets, Translatium's development has been moved to a **closed source** universal code base that runs across macOS, Windows, Linux, Android, iOS and iPadOS.

## Introduction

|macOS|Linux|Windows|
|---|---|---|
|[![GitHub Actions Build Status](https://github.com/quanglam2807/translatium/workflows/macOS/badge.svg)](https://github.com/quanglam2807/translatium/actions)|[![GitHub Actions Build Status](https://github.com/quanglam2807/translatium/workflows/Linux/badge.svg)](https://github.com/quanglam2807/translatium/actions)|[![GitHub Actions Build Status](https://github.com/quanglam2807/translatium/workflows/Windows/badge.svg)](https://github.com/quanglam2807/translatium/actions)|

The legacy code of **[Translatium](https://webcatalog.io/translatium/)** for desktop (version 20 and earlier).

**master** branch only includes the source code of Translatium 9+. For older versions, check out the **legacy-** branches.

---
## Development
```
# First, clone the project:
git clone https://github.com/quanglam2807/translatium.git
cd translatium

# set API keys
export REACT_APP_OCR_SPACE_API_KEY=...

# install the dependencies
yarn

# Run development mode of Translatium
yarn electron-dev

# Build for production
yarn dist
```
