import translateTextWithGoogle from './translate-text-with-google';
import translateTextWithYandex from './translate-text-with-yandex';
import { isGoogleSupported, isYandexSupported } from './language-utils';

const translateText = (inputLang, outputLang, inputText, preferredTranslationService) => {
  if (preferredTranslationService === 'yandex') {
    if (isYandexSupported(inputLang) && isYandexSupported(outputLang)) {
      return translateTextWithYandex(inputLang, outputLang, inputText);
    }
  }

  if (isGoogleSupported(inputLang) && isGoogleSupported(outputLang)) {
    return translateTextWithGoogle(inputLang, outputLang, inputText);
  }

  if (isYandexSupported(inputLang) && isYandexSupported(outputLang)) {
    return translateTextWithYandex(inputLang, outputLang, inputText);
  }

  if (isGoogleSupported(inputLang) && isYandexSupported(outputLang)) {
    return translateTextWithGoogle(inputLang, 'en', inputText)
      .then((output) => translateTextWithYandex('en', outputLang, output.outputText));
  }

  if (isYandexSupported(inputLang) && isGoogleSupported(outputLang)) {
    return translateTextWithYandex(inputLang, 'en', inputText)
      .then((output) => translateTextWithGoogle('en', outputLang, output.outputText));
  }

  return Promise.reject(new Error('Language pair is not supported'));
};

export default translateText;
