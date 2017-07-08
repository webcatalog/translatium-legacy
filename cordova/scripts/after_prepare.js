const fs = require('fs');     // nodejs.org/api/fs.html
const plist = require('plist');  // www.npmjs.com/package/plist


module.exports = () => {
  const filePath = 'platforms/ios/Modern Translator/Modern Translator-Info.plist';

  // eslint-disable-next-line
  console.log('Mofifying', filePath, '...');
  const xml = fs.readFileSync(filePath, 'utf8');
  const obj = plist.parse(xml);

  obj.CFBundleDisplayName = 'Translator';

  const updatedXml = plist.build(obj);
  fs.writeFileSync(filePath, updatedXml, { encoding: 'utf8' });
};
