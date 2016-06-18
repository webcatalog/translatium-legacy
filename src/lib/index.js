import 'whatwg-fetch';

import { translateText } from './translate-text.js';
import { translateArray } from './translate-array.js';
import { translateImage } from './translate-image.js';
import { recognizeSpeech } from './recognize-speech.js';
import { getLanguages,
         getInputLanguages, getOutputLanguages,
         getOcrSupportedLanguages,
         getHandwritingSupportedLanguages,
         getVoiceRecognitionSupportedLanguages,
         getTtsSupportedLanguages,
         isOutput,
         isOcrSupported,
         isVoiceRecognitionSupported,
         isTtsSupported,
         isHandwritingSupported,
         isOnlyMicrosoftSupported,
         isMicrosoftSupported,
       } from './language.js';

// Expose only the usable ones
export default {
  // get Language List
  getLanguages,
  getInputLanguages, getOutputLanguages,
  getOcrSupportedLanguages,
  getHandwritingSupportedLanguages,
  getVoiceRecognitionSupportedLanguages,
  getTtsSupportedLanguages,

  // Check language's supported features
  isOutput,
  isOcrSupported,
  isVoiceRecognitionSupported,
  isTtsSupported,
  isHandwritingSupported,
  isOnlyMicrosoftSupported,
  isMicrosoftSupported,

  translateText,
  translateArray,
  translateImage,
  textToSpeech,
  recognizeSpeech,
};
