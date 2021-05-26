#!/usr/bin/env bash

# Inspired by
# https://github.com/bitwarden/desktop/blob/master/.github/workflows/release.yml
# https://github.com/bitwarden/browser/blob/master/gulpfile.js#L114
# https://github.com/bitwarden/desktop/blob/master/.github/scripts/macos/setup-keychain.ps1

echo "Building Safari Extension"

CURRENT_DIR=$(dirname "$0")

# download certificates
wget --content-disposition "$CSC_LINK" -O $CURRENT_DIR/certificates.p12

# import certificates
security create-keychain -p "$CSC_KEY_PASSWORD" $CURRENT_DIR/build.keychain
security unlock-keychain -p "$CSC_KEY_PASSWORD" $CURRENT_DIR/build.keychain
security set-keychain-settings -lut 1200 $CURRENT_DIR/build.keychain
security import $CURRENT_DIR/certificates.p12 -P "$CSC_KEY_PASSWORD" -k $CURRENT_DIR/build.keychain -T /usr/bin/codesign -T /usr/bin/security -T /usr/bin/productbuild
# https://stackoverflow.com/questions/39868578/security-codesign-in-sierra-keychain-ignores-access-control-settings-and-ui-p
# https://github.com/electron-userland/electron-packager/issues/701#issuecomment-322315996
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$CSC_KEY_PASSWORD" $CURRENT_DIR/build.keychain

# build appex
xcodebuild -project $CURRENT_DIR/translatium/translatium.xcodeproj -alltargets -configuration Release

# sign
codesign --verbose --force -o runtime --sign "3rd Party Mac Developer Application: WebCatalog Ltd" --entitlements $CURRENT_DIR/translatium/safari/safari.entitlements $CURRENT_DIR/translatium/build/Release/safari.appex --keychain $CURRENT_DIR/build.keychain 