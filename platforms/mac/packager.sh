APP_VERSION=$(node -e "console.log(require('./package.json').version);")

# Name of your app.
APP="Modern Translator"
# The path of you app to sign.
APP_PATH="Modern Translator-mas-x64/Modern Translator.app"
# The path of distribution provisioning profile
PROVISION_PROFILE_PATH="distribution.provisionprofile"
# The path of your plist files.
CHILD_PLIST="child.plist"
PARENT_PLIST="parent.plist"

electron-packager ./ "Modern Translator" --app-bundle-id=com.moderntranslator.app --helper-bundle-id=com.moderntranslator.app.helper --app-version=$APP_VERSION --build-version=$APP_VERSION --platform=mas --arch=x64 --version=$ELECTRON_VERSION --icon=images/icon.icns --ignore=.*\.\(provisionprofile\|plist\) --overwrite

electron-osx-sign "$APP_PATH" --provisioning-profile=$PROVISION_PROFILE_PATH --type=distribution --entitlements="$PARENT_PLIST" --entitlements-inherit="$CHILD_PLIST"

electron-osx-flat "$APP_PATH"

codesign --verify --deep --verbose=2 "$APP_PATH"
