#!/bin/bash
export APP_VERSION=$(node -e "console.log(require('./package.json').version);")

sentry-cli releases -o modern-translator -p modern-translator files $APP_VERSION upload-sourcemaps --url-prefix ms-appx://55974nhutquang97.5translate/www platforms/mac/www --ext map
