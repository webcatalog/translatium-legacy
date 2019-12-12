import { translateWithGoogleAsync } from '../senders';

export const googleStandardlizedLanguage = (lang) => {
  if (lang === 'zh-YUE' || lang === 'zh-HK') return 'zh-CN';
  if (lang !== 'zh') {
    const i = lang.indexOf('-');
    if (i > 0) return lang.slice(0, i);
  }
  return lang;
};

let client = 'gtx';

const translateTextWithGoogle = (inputLang, outputLang, inputText, tries) => Promise.resolve()
  .then(() => {
    const opts = {};
    opts.raw = true;
    opts.client = client; // https://github.com/matheuss/google-translate-api/issues/79#issuecomment-425679193
    opts.to = googleStandardlizedLanguage(outputLang);
    if (inputLang !== 'auto') opts.from = googleStandardlizedLanguage(inputLang);
    return translateWithGoogleAsync(inputText, opts);
  })
  .then((res) => {
    const output = {
      inputText,
      outputText: res.text,
      inputLang: res.from.iso,
      outputLang,
      provider: 'google',
    };

    try {
      const result = eval(res.raw); // eslint-disable-line no-eval

      if (result[0]) {
        result[0].forEach((part) => {
          if (!part[0]) {
            if (part[2]) {
              output.outputRoman = output.outputRoman ? output.outputRoman + part[2] : part[2];
            }
            if (part[3]) {
              output.inputRoman = output.inputRoman ? output.inputRoman + part[3] : part[3];
            }
          }
        });
      }

      if ((result[11]) || (result[12]) || (result[13]) || (result[14])) {
        output.inputDict = [result[11], result[12], result[13], result[14]];
      }

      output.outputDict = result[1];
    } catch (_) {} // eslint-disable-line no-empty

    return output;
  })
  .catch((err) => {
    if (tries !== 1) {
      client = client === 'gtx' ? 't' : 'gtx'; // https://github.com/vitalets/google-translate-api/issues/9
      return translateTextWithGoogle(inputLang, outputLang, inputText, 1);
    }
    return Promise.reject(err);
  });

export default translateTextWithGoogle;
