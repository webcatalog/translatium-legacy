import { transliterate as tr } from 'transliteration';
import { transliterate as hebTr } from 'hebrew-transliteration';
import cyrillicToTranslit from 'cyrillic-to-translit-js';
import greekUtils from 'greek-utils';

const transliterate = (text, lang) => {
  // Chinese || Korean
  if (lang.startsWith('zh') || lang === 'ko') {
    return tr(text[0]);
  }
  // Hebrew
  if (lang === 'he') {
    return hebTr(text, { qametsQatan: true });
  }
  // Russian
  if (lang === 'ru') {
    return cyrillicToTranslit({ preset: 'ru' }).transform(text);
  }
  // Ukrainian
  if (lang === 'uk') {
    return cyrillicToTranslit({ preset: 'uk' }).transform(text);
  }
  // Greek
  if (lang === 'el') {
    return greekUtils.toTransliteratedLatin(text);
  }

  return text;
};

export default transliterate;
