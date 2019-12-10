/* global fetch FormData document Image */
import { UPDATE_OCR } from '../../../constants/actions';

import translateArray from '../../../helpers/translate-array';
import openFileToBlobAsync from '../../../helpers/open-file-to-blob-async';
import { toOcrSpaceLanguage } from '../../../helpers/language-utils';

import { openAlert } from '../../root/alert/actions';
import { changeRoute } from '../../root/router/actions';

import { ROUTE_OCR } from '../../../constants/routes';

export const loadImage = () => (dispatch, getState) => {
  const { inputLang, outputLang } = getState().preferences;

  Promise.resolve()
    .then(() => openFileToBlobAsync())
    .then((result) => {
      if (!result) return null;

      dispatch({
        type: UPDATE_OCR,
        ocr: { status: 'loading' },
      });

      // compress
      return new Promise((resolve, reject) => {
        try {
          const imageObj = new Image();
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          imageObj.onload = function onLoad() {
            const maxSize = 1500;
            const ratio = maxSize / Math.max(this.width, this.height);
            const maxWidth = Math.round(this.width * ratio);
            const maxHeight = Math.round(this.height * ratio);

            canvas.width = maxWidth;
            canvas.height = maxHeight;
            context.clearRect(0, 0, maxWidth, maxHeight);
            context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, maxWidth, maxHeight);

            canvas.toBlob((blob) => {
              resolve({
                blob,
                fileName: result.fileName,
              });
            }, 'image/jpeg', 50);
          };

          imageObj.src = URL.createObjectURL(result.blob, { oneTimeOnly: true });
        } catch (err) {
          reject(err);
        }
      });
    })
    .then((result) => {
      if (!result) return;

      const { blob, fileName } = result;

      const formData = new FormData();
      formData.append('apikey', process.env.REACT_APP_OCR_SPACE_API_KEY);
      formData.append('file', blob, fileName);
      formData.append('language', toOcrSpaceLanguage(inputLang));
      formData.append('isOverlayRequired', true);

      fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((t) => {
          const { ParsedResults } = t;

          if (ParsedResults[0].FileParseExitCode !== 1
          || ParsedResults[0].TextOverlay.Lines.length < 1) {
            dispatch({
              type: UPDATE_OCR,
              ocr: null,
            });

            dispatch(openAlert('cannotRecognizeImage'));

            return null;
          }

          const inputText = ParsedResults[0].ParsedText;
          const inputLines = ParsedResults[0].TextOverlay.Lines.map((line) => {
            let lineText = '';

            line.Words.forEach((word) => { lineText += ` ${word.WordText}`; });

            return {
              height: line.MaxHeight,
              top: line.MinTop,
              left: line.Words[0].Left,
              text: lineText,
            };
          });

          const inputArr = inputLines.map((line) => line.text);

          return translateArray(inputLang, outputLang, inputArr)
            .then(({ outputArr, outputText }) => {
              const outputLines = outputArr.map((text, i) => ({
                height: inputLines[i].height,
                top: inputLines[i].top,
                left: inputLines[i].left,
                text,
              }));

              dispatch({
                type: UPDATE_OCR,
                ocr: {
                  status: 'done',
                  imageUrl: URL.createObjectURL(blob, { oneTimeOnly: true }),
                  inputText,
                  inputLines,
                  outputText,
                  outputLines,
                },
              });


              dispatch(changeRoute(ROUTE_OCR));
            });
        })
        .catch((e) => {
        // eslint-disable-next-line
        console.log(e);

          dispatch({
            type: UPDATE_OCR,
            ocr: null,
          });

          dispatch(openAlert('cannotConnectToServer'));
        });
    })
    .catch((e) => {
      // eslint-disable-next-line
      console.log(e);
      // dispatch(openAlert('cannotOpenTheFile'));
    });
};

export const setZoomLevel = (zoomLevel) => (dispatch, getState) => {
  const { ocr } = getState().pages;

  dispatch({
    type: UPDATE_OCR,
    ocr: { ...ocr, zoomLevel },
  });
};

export const setMode = (mode) => (dispatch, getState) => {
  const { ocr } = getState().pages;
  dispatch({
    type: UPDATE_OCR,
    ocr: { ...ocr, mode },
  });
};
