import { transliterate as tr } from 'transliteration';
import { transliterate as hebTr } from 'hebrew-transliteration';
import cyrillicToTranslit from 'cyrillic-to-translit-js';

const transliterate = (text, lang) => {
  // Chinese
  if (lang.startsWith('zh')) {
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

  return text;
};

export default transliterate;
