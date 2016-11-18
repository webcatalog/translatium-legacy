## macOS
### Dev
1. Ensure `electron` is installed
```
npm install electron -g
```
1. Run
```
npm run dev-mac
npm run start-mac
```

### Release
1. Modify app version & electron version in `platforms/mac/packager.sh`.

2. Ensure certificate is installed.

3. Ensure `electron-packager` & `electron-osx-sign` are installed.
```
npm install electron-packager electron-osx-sign -g
```

3. Run
```
npm run build-mac
cd platforms/mac
./packager.sh
```
