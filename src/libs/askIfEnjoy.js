/* global Windows remote */
import getPlatform from './getPlatform';
import openUri from './openUri';

import store from '../store';
import { updateSetting } from '../actions/settings';

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
    case 'mac': {
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

const askToReview = () => {
  const strings = store.getState().strings;

  createDialog({
    message: strings.howAboutRating,
    defaultButtonText: strings.okSure,
    cancelButtonText: strings.noThanks,
    defaultFunc: () => {
      if (getPlatform() === 'mac') {
        openUri('macappstore://itunes.apple.com/app/id1176624652?mt=12');
      } else if (getPlatform() === 'windows') {
        openUri('ms-windows-store://review/?ProductId=9wzdncrcsg9k');
      }
    },
  });
};

const askToGiveFeedback = () => {
  const strings = store.getState().strings;

  createDialog({
    message: strings.wouldYouMindGivingFeedback,
    defaultButtonText: strings.okSure,
    cancelButtonText: strings.noThanks,
    defaultFunc: () => {
      openUri('mailto:support@moderntranslator.com?subject=Feedback');
    },
  });
};


const askIfEnjoy = () => {
  const strings = store.getState().strings;

  createDialog({
    message: strings.enjoy,
    defaultButtonText: strings.yes,
    cancelButtonText: strings.notReally,
    defaultFunc: () => {
      // if already say yes, don't show again for a longer time
      store.dispatch(updateSetting('launchCount', -300));

      askToReview();
    },
    cancelFunc: () => {
      askToGiveFeedback();

      store.dispatch(updateSetting('launchCount', -100));
    },
  });
};

export default askIfEnjoy;
