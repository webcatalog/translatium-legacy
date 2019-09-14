const data = {
  all: [
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
    'xh', 'yi', 'zh', 'zh-CN', 'zh-TW',
  ],
  inputNotSupported: [
    'zh-CN', 'zh-TW',
  ],
  outputNotSupported: [
    'auto',
    'zh',
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


export const toOcrSpaceLanguage = (lang) => data.ocrSpaceSupported[lang] || null;

// Check if language supports OCR
export const isOcrSupported = (lang) => (toOcrSpaceLanguage(lang) !== null);

// Check if language is supported as input
export const isInput = (lang) => !(data.inputNotSupported.indexOf(lang) > -1);

// Check if language is supported as output
export const isOutput = (lang) => !(data.outputNotSupported.indexOf(lang) > -1);

// Get list of all languages
export const getLanguages = () => data.all;

// Get list of all output languages
export const getOutputLanguages = () => data
  .all.filter((x) => data.outputNotSupported.indexOf(x) < 0);

// Get list of all input languages
export const getInputLanguages = () => data
  .all.filter((x) => data.inputNotSupported.indexOf(x) < 0);

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
  return false;
};

// Get list of all languages that support TTS
export const getTTSSupportedLanguages = () => {
  const voices = window.speechSynthesis.getVoices();
  const langs = [];
  for (let i = 0; i < voices.length; i += 1) {
    const voice = voices[i];
    const lang = voice.lang.substring(0, 2);
    if (!langs.includes(lang)) {
      langs.push(lang);
    }
  }
};
