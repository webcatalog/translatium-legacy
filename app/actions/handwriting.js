/* global Windows */

import { UPDATE_HANDWRITING_SUGGESTION_LIST } from '../constants/actions';

import recognizeHandwriting from '../lib/recognizeHandwriting';

import { updateInputText } from './home';

import i18n from '../i18n';

export const resetSuggestionList = () => ({
  type: UPDATE_HANDWRITING_SUGGESTION_LIST,
  suggestionList: null,
});

export const loadSuggestionList = (
  inputInk,
  canvasHeight,
  canvasWidth
) => ((dispatch, getState) => {
  const { settings, home, handwriting } = getState();
  const { inputLang } = settings;
  const { inputText } = home;
  const { suggestionList } = handwriting;

  recognizeHandwriting(inputLang, inputInk, canvasWidth, canvasHeight)
    .then(({ outputArr }) => {
      if (outputArr.length > 0) {
        let newInputText;
        if (suggestionList && suggestionList.length > 0) {
          newInputText = inputText.slice(0, -suggestionList[0].length) + outputArr[0];
        } else {
          newInputText = inputText + outputArr[0];
        }

        dispatch(updateInputText(newInputText));

        dispatch({
          type: UPDATE_HANDWRITING_SUGGESTION_LIST,
          suggestionList: outputArr,
        });
      }
    })
    .catch(() => {
      const title = i18n('connect-problem');
      const content = i18n('check-connect');
      const msg = new Windows.UI.Popups.MessageDialog(content, title);
      msg.showAsync().done();
    });
});
