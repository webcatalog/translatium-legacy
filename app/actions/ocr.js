/* global Windows */
import { UPDATE_OCR_MULTIPLE, TOGGLE_SHOW_ORIGINAL } from '../constants/actions';

import { ocrStandardlizedLanguage } from '../lib/languageUtils';
import translateArray from '../lib/translateArray';

let promise;

export const initOcr = (inputFile) => ((dispatch, getState) => {
  const { inputLang, outputLang } = getState().settings;

  dispatch({
    type: UPDATE_OCR_MULTIPLE,
    newValue: {
      ocrStatus: 'loading',
      originalText: null,
      originalSegments: null,
      translatedText: null,
      translatedSegments: null,
      imgHeight: null,
      imgWidth: null,
      ratio: null,
      inputFile,
      showOriginal: false,
    },
  });

  if (promise) promise.cancel();

  const ocrEngine = Windows.Media.Ocr.OcrEngine.tryCreateFromLanguage(
    new Windows.Globalization.Language(ocrStandardlizedLanguage(inputLang))
  );

  if (!ocrEngine) {
    dispatch({
      type: UPDATE_OCR_MULTIPLE,
      newValue: {
        ocrStatus: 'needOcrLang',
      },
    });
    return;
  }

  let imgWidth;
  let imgHeight;
  let ratio;

  promise = inputFile.openAsync(Windows.Storage.FileAccessMode.read)
    .then(stream => {
      const bitmapDecoder = Windows.Graphics.Imaging.BitmapDecoder;
      return bitmapDecoder.createAsync(stream);
    }).then(decoder => {
      imgWidth = decoder.pixelWidth;
      imgHeight = decoder.pixelHeight;

      ratio = 1;
      const maxImageDimension = Windows.Media.Ocr.OcrEngine.maxImageDimension;
      if (imgHeight > maxImageDimension
        || imgWidth > maxImageDimension) {
        ratio = maxImageDimension / Math.max(imgHeight, imgWidth);
      }
      if (imgHeight < 40 || imgWidth < 40) {
        ratio = Math.min(imgHeight, imgWidth) / 40;
      }

      imgHeight = Math.floor(imgHeight * ratio);
      imgWidth = Math.floor(imgWidth * ratio);


      if (ratio === 1) return decoder.getSoftwareBitmapAsync();

      const bitmapTransform = new Windows.Graphics.Imaging.BitmapTransform();
      bitmapTransform.scaledHeight = imgHeight;
      bitmapTransform.scaledWidth = imgWidth;

      return decoder.getSoftwareBitmapAsync(
        Windows.Graphics.Imaging.BitmapPixelFormat.unknown,
        Windows.Graphics.Imaging.BitmapAlphaMode.premultiplied,
        bitmapTransform,
        Windows.Graphics.Imaging.ExifOrientationMode.ignoreExifOrientation,
        Windows.Graphics.Imaging.ColorManagementMode.doNotColorManage
      );
    })
    .then(bitmap => ocrEngine.recognizeAsync(bitmap))
    .then(result => {
      Promise.resolve()
        .then(() => {
          const originalText = result.text;
          const originalSegments = result.lines;
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
        })
        .then(({
          originalText,
          originalSegments,
          translatedText,
          translatedSegments,
        }) => {
          dispatch({
            type: UPDATE_OCR_MULTIPLE,
            newValue: {
              ocrStatus: 'translated',
              originalText,
              originalSegments,
              translatedText,
              translatedSegments,
              imgHeight,
              imgWidth,
              ratio,
              inputFile,
              showOriginal: false,
            },
          });
        })
        .catch(() => {
          dispatch({
            type: UPDATE_OCR_MULTIPLE,
            newValue: {
              ocrStatus: 'failedToConnect',
            },
          });
        });
    })
    .then(null, () => {
      dispatch({
        type: UPDATE_OCR_MULTIPLE,
        newValue: {
          ocrStatus: 'noTextRecognized',
        },
      });
    });
});

export const toggleShowOriginal = () => ({
  type: TOGGLE_SHOW_ORIGINAL,
});
