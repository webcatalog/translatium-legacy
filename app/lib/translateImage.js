/* global Windows */

import { ocrSpaceStandardlizedLanguage } from './languageUtils';
import translateArray from './translateArray';
import httpClient from './httpClient';

const fetchOcr = (multipartContent) => {
  const uriString = 'https://api.ocr.space/Parse/Image';
  const uri = new Windows.Foundation.Uri(uriString);
  const promise = new Promise((resolve, reject) => {
    httpClient.postAsync(uri, multipartContent)
      .then(response => {
        response.ensureSuccessStatusCode();
        return response.content.readAsStringAsync();
      })
      .done(
        body => { resolve(JSON.parse(body)); },
        err => { reject(err); }
      );
  });

  return promise;
};

const translateImage = (inputLang, outputLang, inputStream, apiKey) => {
  const httpMultipartFormDataContent = new Windows.Web.Http.HttpMultipartFormDataContent();

  httpMultipartFormDataContent.add(
    new Windows.Web.Http.HttpStreamContent(inputStream),
    'file', 'image.jpg'
  );
  httpMultipartFormDataContent.add(
    new Windows.Web.Http.HttpStringContent(ocrSpaceStandardlizedLanguage(inputLang)),
    'language'
  );
  httpMultipartFormDataContent.add(
    new Windows.Web.Http.HttpStringContent(apiKey),
    'apikey'
  );
  httpMultipartFormDataContent.add(
    new Windows.Web.Http.HttpStringContent('true'),
    'isOverlayRequired'
  );

  return fetchOcr(httpMultipartFormDataContent)
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
