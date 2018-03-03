/* global fetch navigator */

import { UPDATE_HANDWRITING_SUGGESTION_LIST } from '../../../../constants/actions';

import insertAtCursor from '../../../../helpers/insert-at-cursor';
import deleteAtCursor from '../../../../helpers/delete-at-cursor';

import { openAlert } from '../../../root/alert/actions';
import { updateInputText } from '../actions';

export const resetSuggestions = () => ({
  type: UPDATE_HANDWRITING_SUGGESTION_LIST,
  suggestions: null,
});

export const loadSuggestions = (
  inputInk,
  canvasHeight,
  canvasWidth,
) => ((dispatch, getState) => {
  const { settings, pages } = getState();
  const { inputLang, chinaMode } = settings;
  const { inputText, selectionStart, selectionEnd } = pages.home;
  const { suggestions } = pages.home.handwriting;

  const endpoint = chinaMode === true ? 'http://www.google.cn' : 'https://www.google.com';

  const uri = `${endpoint}/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8`;
  const jsData = {
    device: navigator.userAgent,
    options: 'enable_pre_space',
    requests: [
      {
        writing_guide: {
          writing_area_width: canvasWidth,
          writing_area_height: canvasHeight,
        },
        ink: inputInk,
        language: inputLang,
      },
    ],
  };

  fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsData),
  })
    .then(response => response.json())
    .then(json => json[1][0][1])
    .then((outputArr) => {
      const deletedText = deleteAtCursor(
        inputText,
        suggestions ? suggestions[0].length : 0,
        selectionStart,
        selectionEnd,
      );

      const insertedText = insertAtCursor(
        deletedText.text,
        outputArr[0],
        deletedText.selectionStart,
        deletedText.selectionEnd,
      );

      dispatch(updateInputText(
        insertedText.text,
        insertedText.selectionStart,
        insertedText.selectionEnd,
      ));

      dispatch({
        type: UPDATE_HANDWRITING_SUGGESTION_LIST,
        suggestions: outputArr,
      });
    })
    .catch(() => {
      dispatch(openAlert('cannotConnectToServer'));
    });
});
