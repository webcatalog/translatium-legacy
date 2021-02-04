/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global fetch FormData document Image */
import { UPDATE_OCR } from '../../../constants/actions';

import amplitude from '../../../amplitude';

import translateArray from '../../../helpers/translate-array';
import openFileToBlobAsync from '../../../helpers/open-file-to-blob-async';
import takeScreenshotToBlobAsync from '../../../helpers/take-screenshot-to-blob-async';
import { toOcrSpaceLanguage } from '../../../helpers/language-utils';

import { openAlert } from '../../root/alert/actions';
import { changeRoute } from '../../root/router/actions';

import { ROUTE_OCR } from '../../../constants/routes';

export const loadImage = (type = 'file') => (dispatch, getState) => {
  const { inputLang, outputLang } = getState().preferences;

  Promise.resolve()
    .then(() => {
      if (type === 'screenshot') {
        return takeScreenshotToBlobAsync();
      }
      return openFileToBlobAsync();
    })
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
                compressed: {
                  blob,
                  fileName: 'compressed.jpg',
                },
                original: result,
                imageWidth: maxWidth,
                imageHeight: maxHeight,
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

      const {
        compressed, original, maxWidth, imageHeight, imageWidth,
      } = result;
      const { blob, fileName } = compressed;

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

              // ensure that image fits on screen
              const visibleWidth = window.innerWidth - (56 * 2); // window width minus paddings
              const zoomLevel = (maxWidth > visibleWidth)
                ? Math.max(Math.round((visibleWidth / maxWidth) * 1e2) / 1e2, 0.1)
                : 1;

              // only log when the action is successful
              if (type === 'screenshot') {
                amplitude.getInstance().logEvent('translate screenshot');
              } else {
                amplitude.getInstance().logEvent('translate image file');
              }

              dispatch({
                type: UPDATE_OCR,
                ocr: {
                  status: 'done',
                  imageUrl: URL.createObjectURL(original.blob, { oneTimeOnly: true }),
                  inputText,
                  inputLines,
                  outputText,
                  outputLines,
                  zoomLevel,
                  imageWidth,
                  imageHeight,
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
      dispatch({
        type: UPDATE_OCR,
        ocr: null,
      });
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
