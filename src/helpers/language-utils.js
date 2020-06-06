const data = {
  all: [
    'auto',
    'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs',
    'bg', 'ca', 'ceb', 'ny', 'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da',
    'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr', 'fy', 'gl', 'ka',
    'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu',
    'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'rw',
    'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms',
    'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'or', 'ps', 'fa',
    'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd',
    'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tg', 'ta', 'tt',
    'te', 'th', 'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh',
    'yi', 'yo', 'zu',
  ],
  ttsSupported: [
    'af',
    'sq',
    'ar',
    'hy',
    'bn',
    'bs',
    'ca',
    'zh-TW',
    'zh-CN',
    'zh-HK',
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
  ocrSpaceSupported: {
    ar: 'ara',
    bg: 'bul',
    cz: 'cze',
    da: 'dan',
    de: 'ger',
    el: 'gre',
    en: 'eng',
    es: 'spa',
    fi: 'fin',
    fr: 'fre',
    hr: 'hrv',
    hu: 'hun',
    it: 'ita',
    ja: 'jpn',
    ko: 'kor',
    nl: 'dut',
    no: 'nor',
    pl: 'pol',
    pt: 'por',
    ru: 'rus',
    sl: 'slv',
    sv: 'swe',
    tr: 'tur',
    zh: 'chs',
  },
};

export const toCountryFreeLanguage = (lang) => {
  const i = lang.indexOf('-');
  if (i > 0) return lang.slice(0, i);
  return lang;
};

export const toOcrSpaceLanguage = (lang) => data.ocrSpaceSupported[lang] || null;

// Check if language supports OCR
export const isOcrSupported = (lang) => (toOcrSpaceLanguage(lang) !== null);

// Check if language is supported as input
export const isInputLanguage = (lang) => data.all.indexOf(lang) > -1;

// Check if language is supported as output
export const isOutputLanguage = (lang) => lang !== 'auto' && data.all.indexOf(lang) > -1;

// Get list of all languages
export const getLanguages = () => data.all;

// Get list of all output languages
export const getOutputLanguages = () => data
  .all.filter((x) => data.outputNotSupported.indexOf(x) < 0);

// Get list of all input languages
export const getInputLanguages = () => data.all;

// Get list of all languages support OCR
export const getOcrSupportedLanguages = () => data.all.filter((lang) => isOcrSupported(lang));

// Check if language supports Text-to-speech
export const isTtsSupported = (lang) => {
  const voices = window.speechSynthesis.getVoices();
  for (let i = 0; i < voices.length; i += 1) {
    const voice = voices[i];
    if (voice.lang.startsWith(lang)) {
      return true;
    }
  }

  return data.ttsSupported.indexOf(lang) > -1
    || data.ttsSupported.indexOf(toCountryFreeLanguage(lang)) > -1;
};

// Get list of all languages that support TTS
export const getTTSSupportedLanguages = () => data.all.filter((lang) => isTtsSupported(lang));
