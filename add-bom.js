const fs = require('fs');

// https://github.com/cqqccqc/webpack-utf8-bom/blob/master/webpack-utf8-bom.js#L29
const addBom = (filePath) => {
  // eslint-disable-next-line no-console
  console.log(`adding bom: ${filePath}`);

  let buff = fs.readFileSync(filePath);

  if (buff.length < 3
    || buff[0].toString(16).toLowerCase() !== 'ef'
    || buff[1].toString(16).toLowerCase() !== 'bb'
    || buff[2].toString(16).toLowerCase() !== 'bf') {
    const bom = new Buffer([0xEF, 0xBB, 0xBF]);
    buff = bom + buff;
    fs.writeFile(filePath, buff.toString(), 'utf8', (err) => {
      if (err) throw err;
    });
  }
};

// https://stackoverflow.com/a/16684530
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((f) => {
    const file = `${dir}/${f}`;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else {
      results = results.concat([file]);
    }
  });
  return results;
};

const files = walk('./build');
files.forEach((file) => {
  const ext = file.substr(file.lastIndexOf('.') + 1);
  if (['js', 'css', 'html'].indexOf(ext) > -1) {
    addBom(file);
  }
});
