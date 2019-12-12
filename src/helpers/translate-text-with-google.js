import { translateWithGoogleAsync } from '../senders';

export const googleStandardlizedLanguage = (lang) => {
  if (lang === 'zh-YUE') return 'zh-HK';
  return lang;
};

const translateTextWithGoogle = (inputLang, outputLang, inputText) => Promise.resolve()
  .then(() => {
    const opts = {};
    opts.raw = true;
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
  });

export default translateTextWithGoogle;
