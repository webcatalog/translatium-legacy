APP_VERSION=6.0.0
ELECTRON_VERSION=1.4.6

electron-packager ./ "Modern Translator" --app-bundle-id=com.moderntranslator.app --helper-bundle-id=com.moderntranslator.app.helper --app-version=$APP_VERSION --build-version=$APP_VERSION --platform=mas --arch=x64 --version=$ELECTRON_VERSION --icon=images/icon.icns --overwrite

# Name of your app.
APP="Modern Translator"
# The path of you app to sign.
APP_PATH="Modern Translator-mas-x64/Modern Translator.app"
# The path to the location you want to put the signed package.
RESULT_PATH="Modern Translator-mas-x64/$APP.pkg"
# The name of certificates you requested.
APP_KEY="3rd Party Mac Developer Application: Quang Lam (FVFM95DDPG)"
INSTALLER_KEY="3rd Party Mac Developer Installer: Quang Lam (FVFM95DDPG)"

FRAMEWORKS_PATH="$APP_PATH/Contents/Frameworks"

codesign --deep -fs "$APP_KEY" --entitlements child.plist "$FRAMEWORKS_PATH/Electron Framework.framework/Libraries/libnode.dylib"
codesign --deep -fs "$APP_KEY" --entitlements child.plist "$FRAMEWORKS_PATH/Electron Framework.framework/Electron Framework"
codesign --deep -fs "$APP_KEY" --entitlements child.plist "$FRAMEWORKS_PATH/Electron Framework.framework/"
codesign --deep -fs "$APP_KEY" --entitlements child.plist "$FRAMEWORKS_PATH/$APP Helper.app/"
codesign --deep -fs "$APP_KEY" --entitlements child.plist "$FRAMEWORKS_PATH/$APP Helper EH.app/"
codesign --deep -fs "$APP_KEY" --entitlements child.plist "$FRAMEWORKS_PATH/$APP Helper NP.app/"
codesign  -fs "$APP_KEY" --entitlements parent.plist "$APP_PATH"
productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_KEY" "$RESULT_PATH"
