const data = {
  all: [
    'auto', 'af', 'sq',
    'ar', 'ar-DZ', 'ar-BH', 'ar-EG', 'ar-IL', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-MA', 'ar-OM',
    'ar-PS', 'ar-QA', 'ar-SA', 'ar-TN', 'ar-AE',
    'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny',
    'zh', 'zh-CN', 'zh-HK', 'zh-TW', 'zh-YUE',
    'hr', 'cs', 'da', 'nl',
    'en', 'en-AU', 'en-CA', 'en-IN', 'en-IE', 'en-NZ', 'en-PH', 'en-ZA', 'en-US', 'en-UK',
    'eo', 'et', 'tl', 'fi', 'fr', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'iw', 'hi',
    'hmn', 'hu', 'is', 'ig', 'id', 'ga',
    'it', 'ja', 'jw', 'kn', 'kk', 'km',
    'ko', 'lo', 'la', 'lv', 'lt', 'mk', 'mg', 'ms', 'ml',
    'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'fa', 'pl',
    'pt', 'pt-PT', 'pt-BR',
    'pa', 'ro', 'ru', 'sr', 'st',
    'si', 'sk', 'sl', 'so',
    'es', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-DO',
    'es-EC', 'es-SV', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA',
    'es-PY', 'es-PE', 'es-PR', 'es-ES', 'es-US', 'es-UY', 'es-VE',
    'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'yi', 'yo', 'zu',
    'am', 'co', 'fy', 'ky', 'haw', 'ku', 'lb', 'sm', 'gd', 'sn', 'sd', 'ps', 'xh',
    'tlh', 'otq', 'yua',
  ],
  outputNotSupported: [
    'auto',
  ],
  microsoftSupported: [
    'he', 'pl', 'ar', 'hi', 'pt', 'bg', 'ca', 'hu', 'ro', 'zh-CN', 'zh-HK', 'zh-TW', 'zh-YUE', 'id',
    'ru', 'it', 'sk', 'cs', 'ja', 'sl', 'da', 'es', 'nl', 'sv', 'en',
    'ko', 'th', 'et', 'lv', 'tr', 'fi', 'lt', 'uk', 'fr', 'ms', 'ur', 'de', 'mt',
    'vi', 'el', 'no', 'cy', 'ht', 'fa', 'tlh', 'otq', 'yua',
  ],
  onlyMicrosoftSupported: [
    'tlh', 'otq', 'yua',
  ],
  voiceRecognitionSupported: [
    'af', 'ar', 'eu', 'bg', 'ca', 'zh', 'hr', 'cs', 'nl', 'tl', 'fi',
    'fr', 'gl', 'de', 'iw', 'hi', 'hu', 'is',
    'id', 'it', 'ja', 'ko', 'ms', 'no', 'pl', 'pt', 'ro',
    'ru', 'sr', 'sk', 'es', 'sv', 'th', 'tr',
    'uk', 'vi', 'zu', 'en',
  ],
  ttsSupported: [
    'af', 'sq', 'ar', 'hy', 'bs', 'ca', 'zh', 'zh-TW', 'hr', 'cs', 'da',
    'nl', 'en', 'eo', 'fi', 'fr', 'de', 'el', 'ht', 'hi', 'hu', 'is', 'id', 'it',
    'ja', 'ko', 'la', 'lv', 'mk', 'no', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'es',
    'sw', 'sv', 'ta', 'th', 'tr', 'vi', 'cy',
  ],
  handwritingNotSupported: [
    'hy', 'ka', 'ig', 'ha', 'yo', 'yi', 'st', 'kk', 'tg', 'uz', 'tlh', 'otq', 'yua',
    'sd', 'ps', 'am',
  ],
  ocrSpaceCodes: {
    cs: 'ce',
    da: 'dan',
    nl: 'dut',
    en: 'eng',
    fi: 'fin',
    de: 'ger',
    hu: 'hun',
    it: 'ita',
    no: 'nor',
    pl: 'pol',
    pt: 'por',
    es: 'spa',
    sv: 'swe',
    'zh-CN': 'chs',
    'zh-TW': 'cht',
    el: 'gre',
    ja: 'jpn',
    ru: 'rus',
    tr: 'tur',
    ko: 'kor',
  },
};

export const googleStandardlizedLanguage = lang => {
  if (lang === 'zh-YUE') return 'zh-HK';
  return lang;
};

export const countryRemovedLanguage = lang => {
  const i = lang.indexOf('-');
  if (i > 0) return lang.slice(0, i);
  return lang;
};

export const ocrStandardlizedLanguage = lang => {
  if (['zh-CN', 'zh-HK'].indexOf(lang) > -1) return 'zh-CN';
  if (['zh-TW', 'zh-YUE'].indexOf(lang) > -1) return 'zh-TW';
  if (lang === 'zh') return 'zh-CN';
  if (lang.length > 2) return lang.substring(0, 2);
  return lang;
};

export const ocrSpaceStandardlizedLanguage = lang =>
  data.ocrSpaceCodes[ocrStandardlizedLanguage(lang)];

// Check if language supports OCR
export const isOcrSupported = lang => (ocrStandardlizedLanguage(lang) in data.ocrSpaceCodes);

// Check if language is supported as output
export const isOutput = lang => !(data.outputNotSupported.indexOf(lang) > -1);

// Check if language supports Voice recognition
export const isVoiceRecognitionSupported = lang =>
  (data.voiceRecognitionSupported.indexOf(countryRemovedLanguage(lang)) > -1);

// Check if language supports Text-to-speech
export const isTtsSupported = lang =>
  (data.ttsSupported.indexOf(countryRemovedLanguage(lang)) > -1);

// Check if language supports Handwriting recognition
export const isHandwritingSupported = lang => !(data.handwritingNotSupported.indexOf(lang) > -1);

// Check if language ONLY supports translating using Microsoft Translator
export const isOnlyMicrosoftSupported = lang => (data.onlyMicrosoftSupported.indexOf(lang) > -1);

// Check if language supports translating using Microsoft Translator
export const isMicrosoftSupported = lang => (data.microsoftSupported.indexOf(lang) > -1);

export const microsoftStandardlizedLanguage = lang => {
  if (['zh-CN', 'zh-HK'].indexOf(lang) > -1) return 'zh-CHS';
  if (['zh-TW', 'zh-YUE'].indexOf(lang) > -1) return 'zh-CHT';
  if (lang === 'auto') return '';
  if (isOnlyMicrosoftSupported(lang)) return lang;
  if (lang.length > 2) return lang.substring(0, 2);
  return lang;
};

// Get list of all languages
export const getLanguages = () => data.all;

// Get list of all output languages
export const getOutputLanguages = () =>
  data.all.filter(x => data.outputNotSupported.indexOf(x) < 0);

// Get list of all input languages
export const getInputLanguages = () => data.all;

// Get list of all languages support OCR
export const getOcrSupportedLanguages = () => data.all.filter(lang => isOcrSupported(lang));

// Get list of all languages support handwriting recognition
export const getHandwritingSupportedLanguages = () =>
  data.all.filter(lang => isHandwritingSupported(lang));

// Get list of all languages support voice recognition
export const getVoiceRecognitionSupportedLanguages = () =>
  data.all.filter(lang => isVoiceRecognitionSupported(lang));

// Get list of all languages support TTS
export const getTtsSupportedLanguages = () =>
  data.all.filter(lang => isTtsSupported(lang));
