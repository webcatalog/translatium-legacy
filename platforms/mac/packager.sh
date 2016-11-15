APP_VERSION=6.0.0
ELECTRON_VERSION=1.4.6

electron-packager ./ "Modern Translator" --app-bundle-id=com.moderntranslator.app --helper-bundle-id=com.moderntranslator.app.helper --app-version=$APP_VERSION --build-version=$APP_VERSION --platform=mas --arch=x64 --version=$ELECTRON_VERSION --icon=images/icon.icns --overwrite
electron-osx-sign "Modern Translator-mas-x64/Modern Translator.app" --version=$APP_VERSION
electron-osx-flat "Modern Translator-mas-x64/Modern Translator.app" --verbose
