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
    'af', 'sq', 'ar', 'hy', 'bs', 'ca', 'zh', 'zh-TW', 'hr', 'cs', 'da',
    'nl', 'en', 'eo', 'fi', 'fr', 'de', 'el', 'ht', 'hi', 'hu', 'is', 'id', 'it',
    'ja', 'ko', 'la', 'lv', 'mk', 'no', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'es',
    'sw', 'sv', 'ta', 'th', 'tr', 'vi', 'cy',
  ],
  handwritingNotSupported: [
    'hy', 'ka', 'ig', 'ha', 'yo', 'yi', 'st', 'kk', 'tg', 'uz',
    'sd', 'ps', 'am',
  ],
  tesseract: {
    /* eslint-disable no-tabs */
    /* eslint-disable quote-props */
    'af': 'afr',
    'ar': 'ara',
    'az': 'aze',
    'be': 'bel',
    'bn': 'ben',
    'bg': 'bul',
    'ca': 'cat',
    'cs': 'ces',
    'zh': 'chi_sim',
    'zh-YUE': 'chi_tra',
    'zh-CN': 'chi_sim',
    'zh-HK': 'chi_sim',
    'zh-TW': 'chi_tra',
    'chr': 'chr', // Cherokee, not supported yet
    'da': 'dan',
    'de': 'deu',
    'el': 'ell',
    'en': 'eng',
    'enm': 'enm',	// English (Old)
    'eo': 'epo',
    'epo_alt': 'epo_alt',	// Esperanto alternative
    'equ': 'equ',	// Math
    'et': 'est',
    'eu': 'eus',
    'fi': 'fin',
    'fr': 'fra',
    'frk': 'frk',	// Frankish
    'frm': 'frm',	// French (Old)
    'gl': 'glg',
    'grc': 'grc',	// Ancient Greek
    'iw': 'heb',
    'hi': 'hin',
    'hr': 'hrv',
    'hu': 'hun',
    'id': 'ind',
    'is': 'isl',
    'it': 'ita',
    'ita_old': 'ita_old', // Italian (Old)
    'ja': 'jpn',
    'kn': 'kan',
    'ko': 'kor',
    'lv': 'lav',
    'lt': 'lit',
    'ml': 'mal',
    'mk': 'mkd',
    'mt': 'mlt',
    'ms': 'msa',
    'nl': 'nld',
    'no': 'nor',
    'pl': 'pol',
    'pt': 'por',
    'ro': 'ron',
    'ru': 'rus',
    'sk': 'slk',
    'sl': 'slv',
    'es': 'spa',
    'spa_old': 'spa_old', // Old Spanish
    'sq': 'sqi',
    'sr': 'srp',
    'sw': 'swa',
    'sv': 'swe',
    'ta': 'tam',
    'te': 'tel',
    'tgl': 'tgl', // Tagalog
    'th': 'tha',
    'tr': 'tur',
    'uk': 'ukr',
    'vi': 'vie',
    /* eslint-enable quote-props */
    /* eslint-enable no-tabs */
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

export const toTesseractLanguage = lang =>
  data.tesseract[lang] || data.tesseract[toCountryRemovedLanguage(lang)] || null;

// Check if language supports OCR
export const isOcrSupported = lang =>
  (toTesseractLanguage(lang) !== null);

// Check if language is supported as input
export const isInput = lang => !(data.all.indexOf(lang) > -1);

// Check if language is supported as output
export const isOutput = lang => !(data.outputNotSupported.indexOf(lang) > -1);

// Check if language supports Voice recognition
export const isVoiceRecognitionSupported = lang =>
  (data.voiceRecognitionSupported.indexOf(toCountryRemovedLanguage(lang)) > -1);

// Check if language supports Text-to-speech
export const isTtsSupported = lang =>
  (data.ttsSupported.indexOf(toCountryRemovedLanguage(lang)) > -1);

// Check if language supports Handwriting recognition
export const isHandwritingSupported = lang => !(data.handwritingNotSupported.indexOf(lang) > -1);

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
export const getTTSSupportedLanguages = () =>
  data.all.filter(lang => isTtsSupported(lang));
