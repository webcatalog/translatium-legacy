#!/usr/bin/env bash

echo "Building Safari Extension"

CURRENT_DIR=$(dirname "$0")

# build appex
xcodebuild -project $CURRENT_DIR/translatium/translatium.xcodeproj -alltargets -configuration Release

# download certificates
wget --content-disposition "$CSC_LINK" -O $CURRENT_DIR/certificates.p12

# import certificates
security import ./certificates.p12 -P "$CSC_KEY_PASSWORD" -A

# sign
codesign --verbose --force -o runtime --sign "3rd Party Mac Developer Application: WebCatalog Ltd" --entitlements $CURRENT_DIR/translatium/safari/safari.entitlements $CURRENT_DIR/translatium/build/Release/safari.appex