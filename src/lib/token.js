export const getGoogleTkk = () => {
  if (sessionStorage.getItem('googleTkk') === null) {
    const url = 'https://translate.google.com/m/translate';
    return fetch(url)
      .then(res => res.text())
      .then(body => {
        const startStr = 'campaign_tracker_id:\'1h\',tkk:';
        const endStr = ',enable_formality:false';
        const startI = body.indexOf(startStr) + startStr.length;
        const endI = body.indexOf(endStr);
        const tkkEval = body.substring(startI, endI);

        /* eslint-disable */
        const x = eval(eval(tkkEval));
        /* eslint-enable */
        sessionStorage.setItem('googleTkk', x);
        return sessionStorage.getItem('googleTkk');
      });
  }
  return Promise.resolve(sessionStorage.getItem('googleTkk'));
};

const generateB = (a, b) => {
  let x = a;
  for (let d = 0; d < b.length - 2; d += 3) {
    let c = b.charAt(d + 2);
    c = c >= 'a' ? c.charCodeAt(0) - 87 : Number(c);
    c = b.charAt(d + 1) === '+' ? x >>> c : x << c;
    x = b.charAt(d) === '+' ? x + c & 4294967295 : x ^ c;
  }
  return x;
};

export const generateGoogleTranslateToken = (a, tkk) => {
  /* eslint-disable */
  for (var e = tkk.split("."), h = Number(e[0]) || 0, g = [], d = 0, f = 0; f < a.length; f++) {
      var c = a.charCodeAt(f);
      128 > c ? g[d++] = c : (2048 > c ? g[d++] = c >> 6 | 192 : (55296 == (c & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (c = 65536 + ((c & 1023) << 10) + (a.charCodeAt(++f) & 1023), g[d++] = c >> 18 | 240, g[d++] = c >> 12 & 63 | 128) : g[d++] = c >> 12 | 224, g[d++] = c >> 6 & 63 | 128), g[d++] = c & 63 | 128)
  }
  a = h;
  for (d = 0; d < g.length; d++) a += g[d], a = generateB(a, "+-a^+6");
  a = generateB(a, "+-3^+b+-f");
  a ^= Number(e[1]) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648);
  a %= 1E6;
  return a.toString() + "." + (a ^ h);
  /* eslint-enable */
};
