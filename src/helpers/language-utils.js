const data = {
  google: [
    'auto', 'af', 'sq', 'am', 'ar', 'ar-DZ', 'ar-BH', 'ar-EG', 'ar-IL',
    'ar-JO', 'ar-KW', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-PS', 'ar-QA', 'ar-SA',
    'ar-TN', 'ar-AE', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca',
    'ceb', 'ny', 'zh', 'zh-CN', 'zh-HK', 'zh-TW', 'co', 'hr',
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
  yandex: [
    'auto',
    'af', 'am', 'ar', 'az', 'ba', 'be', 'bg', 'bn', 'bs',
    'ca', 'ceb', 'cs', 'cy', 'da', 'de', 'el', 'en', 'eo',
    'es', 'et', 'eu', 'fa', 'fi', 'fr', 'ga', 'gd', 'gl',
    'gu', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id', 'is',
    'it', 'ja', 'jv', 'ka', 'kk', 'km', 'kn', 'ko', 'ky',
    'la', 'lb', 'lo', 'lt', 'lv', 'mg', 'mhr', 'mi', 'mk',
    'ml', 'mn', 'mr', 'mrj', 'ms', 'mt', 'my', 'ne', 'nl',
    'no', 'pa', 'pap', 'pl', 'pt', 'ro', 'ru', 'si', 'sk',
    'sl', 'sq', 'sr', 'su', 'sv', 'sw', 'ta', 'te', 'tg',
    'th', 'tl', 'tr', 'tt', 'udm', 'uk', 'ur', 'uz', 'vi',
    'xh', 'yi', 'zh-CN', 'zh-TW',
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
data.all = Array.from(new Set(data.google.concat(data.yandex)));

export const toCountryFreeLanguage = (lang) => {
  const i = lang.indexOf('-');
  if (i > 0) return lang.slice(0, i);
  return lang;
};

export const toOcrSpaceLanguage = (lang) => data.ocrSpaceSupported[lang] || null;

// Check if language supports OCR
export const isOcrSupported = (lang) => (toOcrSpaceLanguage(lang) !== null);

// Check if language is supported as input
export const isInput = (lang) => !(data.all.indexOf(lang) > -1);

// Check if language is supported as output
export const isOutput = (lang) => lang !== 'auto';

// Check if language is supported by provider
export const isGoogleSupported = (lang) => (data.google.indexOf(lang) > -1);
export const isYandexSupported = (lang) => (data.yandex.indexOf(lang) > -1);

// Get list of all languages
export const getLanguages = () => data.all;
export const getGoogleLanguages = () => data.google;
export const getYandexLanguages = () => data.yandex;

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
    // special case for Chinese
    if (lang === 'zh') {
      if (voice.lang === 'zh-CN') {
        return true;
      }
    } else if (voice.lang.startsWith(lang)) {
      return true;
    }
  }

  return data.ttsSupported.indexOf(lang) > -1
    || data.ttsSupported.indexOf(toCountryFreeLanguage(lang)) > -1;
};

// Get list of all languages that support TTS
export const getTTSSupportedLanguages = () => data.all.filter((lang) => isTtsSupported(lang));
