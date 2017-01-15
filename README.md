## Modern Translator Desktop
[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/modern-translator/desktop/blob/master/LICENSE)

Available on [Windows Store](https://www.microsoft.com/store/apps/9wzdncrcsg9k?cid=github) & [Mac App Store](https://itunes.apple.com/us/app/modern-translator/id1176624652).


## Development Guide
### macOS
#### Requirements
1. Xcode (latest).
2. Node.js.

#### Development

2. Run
```
yarn
yarn run dev-mac
yarn run start-mac
```

#### Release

1. Modify app version & electron version in `platforms/mac/packager.sh`.

2. Ensure certificate is installed.

3. Ensure `electron-packager` & `electron-osx-sign` are installed.
```
yarn global add electron-packager electron-osx-sign
```

4. Run
```
yarn
yarn run build-mac
cd platforms/mac
./packager.sh
```

---

### Windows 10
#### Requirements
1. Visual Studio 2015.
2. Node.js (recommend using [Bash for Windows](https://msdn.microsoft.com/en-us/commandline/wsl/about)).

#### Development
1. Run
```
yarn
yarn run dev-windows
```
2. Open `platforms/windows/Modern Translator.sln` with Visual Studio and run the project.

#### Release
1. Run
```
yarn
yarn run build-windows
```
2. Open `platforms/windows/Modern Translator.sln` with Visual Studio and build the project.
