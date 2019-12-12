import { translateWithGoogle } from '../senders';

const translateTextWithGoogle = (inputLang, outputLang, inputText) => Promise.resolve()
  .then(() => {
    const opts = {};
    opts.to = outputLang;
    if (inputLang !== 'auto') opts.from = inputLang;
    const res = translateWithGoogle(inputText, opts);
    if (res instanceof Error) {
      return Promise.reject(res);
    }
    return {
      inputText,
      outputText: res.text,
      inputLang: res.from.iso,
      outputLang,
    };
  });

export default translateTextWithGoogle;
