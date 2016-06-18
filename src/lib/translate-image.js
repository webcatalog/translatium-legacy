import { ocrSpaceStandardlizedLanguage } from './language.js';
import { translateArray } from './translate-array.js';

export const translateImage = (inputLang, outputLang, inputBlob, apiKey) => {
  const formData = new FormData();

  formData.append('file', inputBlob, 'image.jpg');
  formData.append('language', ocrSpaceStandardlizedLanguage(inputLang));
  formData.append('apikey', apiKey);
  formData.append('isOverlayRequired', true);

  fetch('https://api.ocr.space/Parse/Image', {
    method: 'POST',
    body: formData,
  })
  .then(res => res.json())
  .then(result => {
    // Successful
    if (result.OCRExitCode === '1') {
      const originText = result.ParsedResults[0].ParsedText;
      const originSegments = result.ParsedResults[0].TextOverlay.Lines.map(parsedLine => {
        const line = {};
        line.words = parsedLine.Words.map(word => ({
          text: word.WordText,
          boundingRect: {
            x: word.Left,
            y: word.Top,
            height: word.Height,
          },
        }));
        return line;
      });

      return { originText, originSegments };
    }
    // Failed
    return Promise.reject('OCRSpace failed to recognize your image.');
  })
  .then(r => {
    const { originText, originSegments } = r;

    if (inputLang === outputLang) {
      return {
        originText,
        originSegments,
        translatedText: originText,
        translatedSegments: originSegments,
      };
    }

    const inputArr = originSegments.map(line => {
      let lineText = '';
      line.words.forEach(word => {
        lineText += `${word.text} `;
      });
      return lineText;
    });

    return translateArray(inputLang, outputLang, inputArr)
      .then(({ status, result }) => {
        if (status === 0) {
          return Promise.reject('Failed to translate the text.');
        }

        const translatedSegments = originSegments.map((line, i) => ({
          text: result.outputArr[i],
          boundingRect: line.words[0].boundingRect,
        }));
        const translatedText = translatedSegments.join('\n');

        return {
          originText,
          originSegments,
          translatedText,
          translatedSegments,
        };
      });
  });
};
