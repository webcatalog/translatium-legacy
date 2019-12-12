import translateTextWithGoogle from './translate-text-with-google';

const translateText = (inputLang, outputLang, inputText) => translateTextWithGoogle(
  inputLang, outputLang, inputText,
);

export default translateText;
