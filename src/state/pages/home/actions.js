/* global Windows remote */
import {
  TOGGLE_FULLSCREEN_INPUT_BOX,
  UPDATE_IME_MODE,
  UPDATE_INPUT_TEXT,
  UPDATE_OUTPUT,
} from '../../../constants/actions';

import translateText from '../../../helpers/translate-text';
import phrasebookDb from '../../../helpers/phrasebook-db';
import getPlatform from '../../../helpers/get-platform';
import openUri from '../../../helpers/open-uri';

import { openAlert } from '../../root/alert/actions';
import { updateSetting } from '../../root/settings/actions';
import { addHistoryItem } from './history/actions';

export const toggleFullscreenInputBox = () => ({
  type: TOGGLE_FULLSCREEN_INPUT_BOX,
});

export const translate = saveToHistory => ((dispatch, getState) => {
  const { settings, pages: { home } } = getState();
  const { inputLang, outputLang, chinaMode } = settings;
  const { inputText, fullscreenInputBox } = home;

  // Safe
  if (inputText.trim().length < 1) return;

  const identifier = Date.now();

  if (fullscreenInputBox === true) {
    dispatch(toggleFullscreenInputBox());
  }

  dispatch({
    type: UPDATE_OUTPUT,
    output: {
      status: 'loading',
      identifier,
    },
  });

  translateText(inputLang, outputLang, inputText, chinaMode)
    .then((result) => {
      // Prevent slow request to display outdated info
      const currentOutput = getState().pages.home.output;
      if (currentOutput && currentOutput.identifier === identifier) {
        const r = result;
        r.status = 'done';
        r.inputLang = inputLang;
        r.outputLang = outputLang;
        r.inputText = inputText;

        if (saveToHistory === true) {
          dispatch(addHistoryItem(r));
        }

        dispatch({
          type: UPDATE_OUTPUT,
          output: r,
        });
      }
    })
    .catch(() => {
      // Prevent slow request to display outdated info
      const currentOutput = getState().pages.home.output;
      if (currentOutput && currentOutput.identifier === identifier) {
        dispatch(openAlert('cannotConnectToServer'));

        dispatch({
          type: UPDATE_OUTPUT,
          output: null,
        });
      }
    });
});

export const updateInputText = (inputText, selectionStart, selectionEnd) =>
  ((dispatch, getState) => {
    const { settings, pages: { home } } = getState();
    const realtime = settings.realtime;
    const currentInputText = home.inputText;
    const fullscreenInputBox = home.fullscreenInputBox;

    dispatch({ type: UPDATE_INPUT_TEXT, inputText, selectionStart, selectionEnd });

    // No change in inputText, no need to re-run task
    if (currentInputText === inputText) return;

    if (realtime === true && fullscreenInputBox === false && inputText.trim().length > 0) {
      // delay to save bandwidth
      const tmpHome = getState().pages.home;
      setTimeout(() => {
        if (getState().pages.home.inputText !== inputText) return;
        dispatch(translate());
      }, tmpHome.output ? 300 : 0);
    } else {
      dispatch({
        type: UPDATE_OUTPUT,
        output: null,
      });
    }
  });

export const insertInputText = text =>
  (dispatch, getState) => {
    const { pages: { home } } = getState();
    const { inputText, selectionStart } = home;

    const newText = inputText.length < 1 ? text : `${inputText} ${text}`;

    dispatch(updateInputText(newText, selectionStart, newText.length));
  };

export const togglePhrasebook = () => ((dispatch, getState) => {
  const { output } = getState().pages.home;

  const phrasebookId = output.phrasebookId;

  if (phrasebookId) {
    phrasebookDb.get(phrasebookId)
      .then(doc => phrasebookDb.remove(doc))
      .then(() => {
        const newOutput = Object.assign({}, output, { phrasebookId: null });

        dispatch({
          type: UPDATE_OUTPUT,
          output: newOutput,
        });
      });
  } else {
    const newPhrasebookId = new Date().toJSON();
    phrasebookDb.put({
      _id: newPhrasebookId,
      data: output,
      phrasebookVersion: 3,
    })
      .then(() => {
        dispatch({
          type: UPDATE_OUTPUT,
          output: Object.assign({}, output, { phrasebookId: newPhrasebookId }),
        });
      });
  }
});

export const loadOutput = output => ((dispatch) => {
  // First load output
  dispatch({
    type: UPDATE_OUTPUT,
    output,
  });

  // Update inputLang, outputLang, inputText without running anything;
  dispatch(updateSetting('inputLang', output.inputLang));
  dispatch(updateSetting('outputLang', output.outputLang));
  dispatch({
    type: UPDATE_INPUT_TEXT,
    inputText: output.inputText,
    selectionStart: 0,
    selectionEnd: 0,
  });
});

export const updateImeMode = imeMode => ({
  type: UPDATE_IME_MODE,
  imeMode,
});

const createDialog = ({
  message,
  defaultButtonText,
  cancelButtonText,
  defaultFunc,
  cancelFunc = () => {},
}) => {
  switch (getPlatform()) {
    case 'windows': {
      const msg = new Windows.UI.Popups.MessageDialog(message);

      // Add commands and set their command handlers
      msg.commands.append(new Windows.UI.Popups.UICommand(defaultButtonText, defaultFunc));
      msg.commands.append(new Windows.UI.Popups.UICommand(cancelButtonText, cancelFunc));

      // Set the command that will be invoked by default
      msg.defaultCommandIndex = 0;

      // Set the command to be invoked when escape is pressed
      msg.cancelCommandIndex = 1;


      msg.showAsync();

      return;
    }
    case 'electron': {
      if (window.electron !== 'darwin') return;

      remote.dialog.showMessageBox({
        type: 'info',
        buttons: [defaultButtonText, cancelButtonText],
        defaultId: 1,
        message,
      }, (response) => {
        if (response === 0) {
          defaultFunc();
          return;
        }
        cancelFunc();
      });

      return;
    }
    default: {
      /* eslint-disable no-console */
      console.log('Platform does not support dialog.');
      /* eslint-enable no-console */
    }
  }
};

const askToReview = () =>
  (dispatch, getState) => {
    const strings = getState().strings;

    createDialog({
      message: strings.howAboutRating,
      defaultButtonText: strings.okSure,
      cancelButtonText: strings.noThanks,
      defaultFunc: () => {
        switch (getPlatform()) {
          case 'windows': {
            openUri('ms-windows-store://review/?ProductId=9wzdncrcsg9k');
            break;
          }
          case 'electron': {
            openUri('macappstore://itunes.apple.com/app/id1176624652?mt=12');
            break;
          }
          default: {
            /* eslint-disable no-console */
            console.log('Platform does not support review.');
            /* eslint-enable no-console */
          }
        }
      },
    });
  };

const askToGiveFeedback = () =>
  (dispatch, getState) => {
    const strings = getState().strings;

    createDialog({
      message: strings.wouldYouMindGivingFeedback,
      defaultButtonText: strings.okSure,
      cancelButtonText: strings.noThanks,
      defaultFunc: () => {
        openUri('mailto:support@translatiumapp.com?subject=Feedback');
      },
    });
  };


export const askIfEnjoy = () =>
  (dispatch, getState) => {
    const strings = getState().strings;

    createDialog({
      message: strings.enjoy,
      defaultButtonText: strings.yes,
      cancelButtonText: strings.notReally,
      defaultFunc: () => {
        // if already say yes, don't show again for a longer time
        dispatch(updateSetting('launchCount', -300));

        dispatch(askToReview());
      },
      cancelFunc: () => {
        dispatch(updateSetting('launchCount', -100));
        dispatch(askToGiveFeedback());
      },
    });
  };
