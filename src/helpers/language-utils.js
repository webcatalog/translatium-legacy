const data = {
  all: [
    'auto', 'af', 'sq', 'am', 'ar', 'ar-DZ', 'ar-BH', 'ar-EG', 'ar-IL',
    'ar-JO', 'ar-KW', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-PS', 'ar-QA', 'ar-SA',
    'ar-TN', 'ar-AE', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca',
    'ceb', 'ny', 'zh', 'zh-YUE', 'zh-CN', 'zh-HK', 'zh-TW', 'co', 'hr',
    'cs', 'da', 'nl', 'en', 'en-AU', 'en-CA', 'en-IN', 'en-IE', 'en-NZ',
    'en-PH', 'en-ZA', 'en-UK', 'en-US', 'eo', 'et', 'tl', 'fi', 'fr',
    'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw',
    'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw',
    'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt',
    'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my',
    'ne', 'no', 'ps', 'fa', 'pl', 'pt', 'pt-BR', 'pt-PT', 'pa',
    'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk',
    'sl', 'so', 'es', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR',
    'es-DO', 'es-EC', 'es-SV', 'es-GT', 'es-HN', 'es-MX', 'es-NI',
    'es-PA', 'es-PY', 'es-PE', 'es-PR', 'es-ES', 'es-US', 'es-UY',
    'es-VE', 'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk',
    'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu',
  ],
  outputNotSupported: [
    'auto',
  ],
  voiceRecognitionSupported: [
    'af', 'ar', 'eu', 'bg', 'ca', 'zh', 'hr', 'cs', 'nl', 'tl', 'fi',
    'fr', 'gl', 'de', 'iw', 'hi', 'hu', 'is',
    'id', 'it', 'ja', 'ko', 'ms', 'no', 'pl', 'pt', 'ro',
    'ru', 'sr', 'sk', 'es', 'sv', 'th', 'tr',
    'uk', 'vi', 'zu', 'en',
  ],
  ttsSupported: [
    'af',
    'sq',
    'ar',
    'hy',
    'bn',
    'bs',
    'ca',
    'zh',
    'zh-TW',
    'hr',
    'cs',
    'da',
    'nl',
    'en',
    'eo',
    'fi',
    'fr',
    'de',
    'el',
    'hi',
    'hu',
    'is',
    'id',
    'it',
    'ja',
    'km',
    'ko',
    'la',
    'lv',
    'mk',
    'no',
    'pl',
    'pt',
    'ro',
    'ru',
    'sr',
    'si',
    'sk',
    'es',
    'sw',
    'sv',
    'ta',
    'th',
    'tr',
    'uk',
    'vi',
    'cy',
  ],
  handwritingNotSupported: [
    'hy', 'ka', 'ig', 'ha', 'yo', 'yi', 'st', 'kk', 'tg', 'uz',
    'sd', 'ps', 'am',
  ],
  ocrSpaceSupported: {
    cz: 'ce',
    da: 'dan',
    nl: 'dut',
    en: 'eng',
    fi: 'fin',
    fr: 'fre',
    de: 'ger',
    hu: 'hun',
    it: 'ita',
    no: 'nor',
    pl: 'pol',
    pt: 'por',
    es: 'spa',
    sv: 'swe',
    'zh-CN': 'chs',
    el: 'gre',
    ja: 'jpn',
    ru: 'rus',
    tr: 'tur',
    'zh-TW': 'cht',
    ko: 'kor',
  },
};

export const toGoogleStandardlizedLanguage = (lang) => {
  if (lang === 'zh-YUE') return 'zh-HK';
  return lang;
};

export const toCountryRemovedLanguage = (lang) => {
  const i = lang.indexOf('-');
  if (i > 0) return lang.slice(0, i);
  return lang;
};

export const toOcrSpaceLanguage = (lang) => {
  if (lang === 'zh-YUE' || lang === 'zh-HK') return data.ocrSpaceSupported['zh-TW'];
  if (lang === 'zh') return data.ocrSpaceSupported['zh-CN'];

  return data.ocrSpaceSupported[toCountryRemovedLanguage(lang)] || null;
};

// Check if language supports OCR
export const isOcrSupported = lang => (toOcrSpaceLanguage(lang) !== null);

// Check if language is supported as input
export const isInput = lang => !(data.all.indexOf(lang) > -1);

// Check if language is supported as output
export const isOutput = lang => !(data.outputNotSupported.indexOf(lang) > -1);

// Check if language supports Voice recognition
export const isVoiceRecognitionSupported = (lang) => {
  if (lang === 'zh-YUE') return false;

  return (data.voiceRecognitionSupported.indexOf(toCountryRemovedLanguage(lang)) > -1);
};

// Check if language supports Text-to-speech
export const isTtsSupported = lang => (data.ttsSupported
  .indexOf(toCountryRemovedLanguage(lang)) > -1);

// Check if language supports Handwriting recognition
export const isHandwritingSupported = lang => !(data.handwritingNotSupported.indexOf(lang) > -1);

// Get list of all languages
export const getLanguages = () => data.all;

// Get list of all output languages
export const getOutputLanguages = () => data.all
  .filter(x => data.outputNotSupported.indexOf(x) < 0);

// Get list of all input languages
export const getInputLanguages = () => data.all;

// Get list of all languages support OCR
export const getOcrSupportedLanguages = () => data.all.filter(lang => isOcrSupported(lang));

// Get list of all languages support handwriting recognition
export const getHandwritingSupportedLanguages = () => data.all
  .filter(lang => isHandwritingSupported(lang));

// Get list of all languages support voice recognition
export const getVoiceRecognitionSupportedLanguages = () => data.all
  .filter(lang => isVoiceRecognitionSupported(lang));

// Get list of all languages support TTS
export const getTTSSupportedLanguages = () => data.all.filter(lang => isTtsSupported(lang));
