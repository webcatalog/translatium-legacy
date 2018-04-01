/* eslint-disable */
 
import fs from 'fs-extra';

import { 
    getLanguages,
    isVoiceRecognitionSupported,
    isHandwritingSupported,
    isTtsSupported,
    isOcrSupported,
} from './src/helpers/language-utils';

import strings from './src/strings/en.languages.json';

const languages = getLanguages()
    .filter(lang => lang !== 'auto')
    .map((lang) => {
        return {
            type: true,
            speak: isVoiceRecognitionSupported(lang),
            listen: isTtsSupported(lang),
            write: isHandwritingSupported(lang),
            snap: isOcrSupported(lang),
            id: lang,
            string: strings[lang],
        };
    });

fs.ensureDirSync('./docs/data');
fs.writeJSONSync('./docs/data/languages.json', languages);