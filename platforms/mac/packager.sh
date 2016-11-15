electron-packager ./ "Modern Translator" --app-bundle-id=com.moderntranslator.app --helper-bundle-id=com.moderntranslator.app.helper --app-version=6.0.0 --build-version=6.0.0 --platform=mas --arch=x64 --version=1.4.6 --icon=images/icon.icns --overwrite
electron-osx-sign "Modern Translator-mas-x64/Modern Translator.app" --verbose
