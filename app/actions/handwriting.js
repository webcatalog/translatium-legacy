/* global fetch navigator */

import { UPDATE_HANDWRITING_SUGGESTION_LIST } from '../constants/actions';

import { updateInputText } from './home';

import insertAtCursor from '../libs/insertAtCursor';
import deleteAtCursor from '../libs/deleteAtCursor';

export const resetSuggestions = () => ({
  type: UPDATE_HANDWRITING_SUGGESTION_LIST,
  suggestions: null,
});

export const loadSuggestions = (
  inputInk,
  canvasHeight,
  canvasWidth
) => ((dispatch, getState) => {
  const { settings, home, handwriting } = getState();
  const { inputLang } = settings;
  const { inputText, selectionStart, selectionEnd } = home;
  const { suggestions } = handwriting;

  const uri = 'https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8';
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
      selectionEnd
    );

    const insertedText = insertAtCursor(
      deletedText.text,
      outputArr[0],
      deletedText.selectionStart,
      deletedText.selectionEnd
    );

    dispatch(updateInputText(
      insertedText.text,
      insertedText.selectionStart,
      insertedText.selectionEnd
    ));

    dispatch({
      type: UPDATE_HANDWRITING_SUGGESTION_LIST,
      suggestions: outputArr,
    });
  })
  .catch(() => {
    /*
    const title = i18n('connect-problem');
    const content = i18n('check-connect');
    const msg = new Windows.UI.Popups.MessageDialog(content, title);
    msg.showAsync().done();
    */
  });
});
