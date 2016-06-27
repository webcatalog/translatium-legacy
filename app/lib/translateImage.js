import { ocrSpaceStandardlizedLanguage } from './languageUtils';
import translateArray from './translateArray';

const translateImage = (inputLang, outputLang, inputBlob, apiKey) => {
  const formData = new FormData();

  formData.append('file', inputBlob, 'image.jpg');
  formData.append('language', ocrSpaceStandardlizedLanguage(inputLang));
  formData.append('apikey', apiKey);
  formData.append('isOverlayRequired', true);

  return fetch('https://api.ocr.space/Parse/Image', {
    method: 'POST',
    body: formData,
  })
  .then(res => res.json())
  .then(result => {
    // Successful
    if (result.OCRExitCode === 1) {
      const originalText = result.ParsedResults[0].ParsedText;
      const originalSegments = result.ParsedResults[0].TextOverlay.Lines.map(parsedLine => {
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

      return { originalText, originalSegments };
    }
    // Failed
    return Promise.reject(new Error('OCRSpace failed to recognize your image.'));
  })
  .then(r => {
    const { originalText, originalSegments } = r;

    if (inputLang === outputLang) {
      return {
        originalText,
        originalSegments,
        translatedText: originalText,
        translatedSegments: originalSegments,
      };
    }

    const inputArr = originalSegments.map(line => {
      let lineText = '';
      line.words.forEach(word => {
        lineText += `${word.text} `;
      });
      return lineText;
    });

    return translateArray(inputLang, outputLang, inputArr)
      .then(({ outputArr }) => {
        const translatedSegments = originalSegments.map((line, i) => ({
          text: outputArr[i],
          boundingRect: line.words[0].boundingRect,
        }));

        let translatedText = '';
        translatedSegments.forEach(line => {
          translatedText += `${line.text}\n`;
        });

        return {
          originalText,
          originalSegments,
          translatedText,
          translatedSegments,
        };
      });
  });
};

export default translateImage;
