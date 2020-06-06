/* eslint-disable */
// extracted from Google Translate Chrome extension
// https://chrome.google.com/webstore/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb
// retrived from aapbdbdomjkkjkaonfhkkikfgjllcleb/popup_compiled.js

let Tb = null;

function Sb(a, b) {
  for (let c = 0; c < b.length - 2; c += 3) {
    let d = b.charAt(c + 2);
    d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
    d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
    a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
  }
  return a
};

function Rb(a) {
  return function() {
    return a;
  };
}

function Ub(a) {
  if (null !== Tb) var b = Tb;
  else {
    b = Rb(String.fromCharCode(84));
    var c = Rb(String.fromCharCode(75));
    b = [b(), b()];
    b[1] = c();
    // b = (Tb = window[b.join(c())] || "") || ""
    // window[b.join(c())] is TKK. See https://github.com/matheuss/google-translate-token
    // The extension is not using TKK at all, so we can just ignore it`
    b = (Tb = "") || ""
  }
  var d = Rb(String.fromCharCode(116));
  c = Rb(String.fromCharCode(107));
  d = [d(), d()];
  d[1] = c();
  c = "&" + d.join("") + "=";
  d = b.split(".");
  b = Number(d[0]) || 0;
  for (var e = [], f = 0, g = 0; g < a.length; g++) {
    var k = a.charCodeAt(g);
    128 > k ? e[f++] = k : (2048 > k ? e[f++] = k >> 6 | 192 : (55296 == (k & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (k = 65536 + ((k & 1023) << 10) + (a.charCodeAt(++g) & 1023), e[f++] = k >> 18 | 240, e[f++] = k >> 12 & 63 | 128) : e[f++] = k >> 12 | 224, e[f++] = k >> 6 & 63 | 128), e[f++] = k & 63 | 128)
  }
  a = b;
  for (f = 0; f < e.length; f++) a += e[f], a = Sb(a, "+-a^+6");
  a = Sb(a, "+-3^+b+-f");
  a ^= Number(d[1]) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648);
  a %= 1E6;
  // return c + (a.toString() + "." + (a ^ b));
  // c == '&tk=' so strip it away
  return (a.toString() + "." + (a ^ b));
};

export default Ub;
