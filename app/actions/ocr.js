/* global Windows */
import { UPDATE_OCR_MULTIPLE, TOGGLE_SHOW_ORIGINAL } from '../constants/actions';

import translateImage from '../lib/translateImage';

const apiKey = '0088228ab088957';

export const resetOcr = () => ({
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
    inputFile: null,
    showOriginal: false,
  },
});

export const initOcr = (inputFile) => ((dispatch, getState) => {
  const { inputLang, outputLang } = getState().settings;

  dispatch(resetOcr());

  let imgWidth;
  let imgHeight;
  let ratio;
  const inMemoryRandomAccessStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
  inputFile.openAsync(Windows.Storage.FileAccessMode.read)
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

      return Windows.Graphics.Imaging.BitmapEncoder.createForTranscodingAsync(
        inMemoryRandomAccessStream, decoder
      );
    })
    .then(encoder => {
      const e = encoder;
      if (ratio !== 1) {
        e.bitmapTransform.scaledHeight = imgHeight;
        e.bitmapTransform.scaledWidth = imgWidth;
      }
      return e.flushAsync();
    })
    .then(() => inMemoryRandomAccessStream.flushAsync())
    .then(() => {
      translateImage(inputLang, outputLang, inMemoryRandomAccessStream, apiKey)
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
        .catch(err => {
          if (err.message === 'OCRSpace failed to recognize your image.') {
            dispatch({
              type: UPDATE_OCR_MULTIPLE,
              newValue: {
                ocrStatus: 'noTextRecognized',
              },
            });
          } else {
            dispatch({
              type: UPDATE_OCR_MULTIPLE,
              newValue: {
                ocrStatus: 'failedToConnect',
              },
            });
          }
        });
    });
});

export const toggleShowOriginal = () => ({
  type: TOGGLE_SHOW_ORIGINAL,
});
