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
    "auto"
  ],
  microsoftSupported: [
    "he", "pl", "ar", "hi", "pt", "bg", "ca", "hu", "ro", "zh-CN", "zh-HK", "zh-TW", "zh-YUE", "id",
    "ru", "it", "sk", "cs", "ja", "sl", "da", "es", "nl", "sv", "en",
    "ko", "th", "et", "lv", "tr", "fi", "lt", "uk", "fr", "ms", "ur", "de", "mt",
    "vi", "el", "no", "cy", "ht", "fa", "tlh", "otq", "yua"
  ],
  onlyMicrosoftSupported: [
    "tlh", "otq", "yua"
  ],
  speakSupported: [
    "af", "ar", "eu", "bg", "ca", "zh", "hr", "cs", "nl", "tl", "fi", "fr", "gl", "de", "iw", "hi", "hu", "is",
    "id",  "it", "ja", "ko", "ms", "no", "pl", "pt", "ro", "ru", "sr", "sk", "es", "sv", "th", "tr",
    "uk", "vi", "zu", "en"
  ],
  listenSupported: [
    "af", "sq", "ar", "hy", "bs", "ca", "zh", "zh-TW", "hr", "cs", "da",
    "nl", "en", "eo", "fi", "fr", "de", "el", "ht", "hi", "hu", "is", "id", "it",
    "ja", "ko", "la", "lv", "mk", "no", "pl", "pt", "ro", "ru", "sr", "sk", "es",
    "sw", "sv", "ta", "th", "tr", "vi", "cy"
  ],
  writeNotSupported: [
    "hy", "ka", "ig", "ha", "yo", "yi", "st", "kk", "tg", "uz", "tlh", "otq", "yua"
  ],
  ocrSupported: [
    "en", "zh-CN", "zh-TW", "cs", "da", "nl", "fi", "fr", "de", "el", "hu", "it", "ja", "ko",
    "no", "pl", "pt", "ru", "es", "sv", "tr"
  ],
  ocrSpaceCodes: {
    "cs": "ce",
    "da": "dan",
    "nl": "dut",
    "en": "eng",
    "fi": "fin",
    "de": "ger",
    "hu": "hun",
    "it": "ita",
    "no": "nor",
    "pl": "pol",
    "pt": "por",
    "es": "spa",
    "sv": "swe",
    "zh-CN": "chs",
    "zh-TW": "cht",
    "el": "gre",
    "ja": "jpn",
    "ru": "rus",
    "tr": "tur",
    "ko": "kor"
  }
}

class LanguageUtils {
  static getLanguages() {
    return data.all
  }

  static getOutputLanguages() {
    return data.all.filter(x => data.outputNotSupported.indexOf(x) < 0)
  }

  static getInputLanguages() {
    return data.all
  }

  static getOcrSupportedLanguages() {
    return data.all.filter(lang => {
      return LanguageUtils.ocrSupported(lang)
    })
  }

  static microsoftStandardlized(lang) {
    if (["zh-CN", "zh-HK"].indexOf(lang) > -1) return "zh-CHS"
    if (["zh-TW", "zh-YUE"].indexOf(lang) > -1) return "zh-CHT"
    if (lang == "auto") return ""
    if (data.onlyMicrosoftSupported.indexOf(lang) > -1) return lang
    if (lang.length > 2) return lang.substring(0, 2)
    return lang
  }

  static googleStandardlized(lang) {
    if (lang == "zh-YUE") return "zh-HK"
    return lang
  }

  static ocrStandardlized(lang) {
    if (["zh-CN", "zh-HK"].indexOf(lang) > -1) return "zh-CN"
    if (["zh-TW", "zh-YUE"].indexOf(lang) > -1) return "zh-TW"
    if (lang == "zh") return "zh-CN"
    if (lang.length > 2) return lang.substring(0, 2)
    return lang
  }

  static ocrSpaceStandardlized(lang) {
    return data.ocrSpaceCodes[LanguageUtils.ocrStandardlized(lang)]
  }

  static countryRemoved(lang) {
    let i = lang.indexOf("-")
    if (i > 0) return lang.slice(0, i)
    return lang
  }

  static outputSupported(lang) {
    return !(data.outputNotSupported.indexOf(lang) > -1)
  }

  static ocrSupported(lang) {
    return (LanguageUtils.ocrStandardlized(lang) in data.ocrSpaceCodes)
  }

  static speakSupported(lang) {
    return (data.speakSupported.indexOf(LanguageUtils.countryRemoved(lang)) > -1)
  }

  static listenSupported(lang) {
    return (data.listenSupported.indexOf(LanguageUtils.countryRemoved(lang)) > -1)
  }

  static writeSupported(lang) {
    return !(data.writeNotSupported.indexOf(lang) > -1)
  }

  static onlyMicrosoftSupported(lang) {
    return (data.onlyMicrosoftSupported.indexOf(lang) > -1)
  }

  static microsoftSupported(lang) {
    return (data.microsoftSupported.indexOf(lang) > -1)
  }

}

export default LanguageUtils
