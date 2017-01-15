/* global Windows strings */

import openUri from './openUri';

const askToPurchase = () => {
  const msg = new Windows.UI.Popups.MessageDialog(strings.onlyAvailableFullVersion);

  // Add commands and set their command handlers
  msg.commands.append(new Windows.UI.Popups.UICommand(strings.buyNow, () => {
    openUri('ms-windows-store://pdp/?ProductId=9wzdncrcsg9k');
  }));
  msg.commands.append(new Windows.UI.Popups.UICommand(strings.later));

  // Set the command that will be invoked by default
  msg.defaultCommandIndex = 0;

  // Set the command to be invoked when escape is pressed
  msg.cancelCommandIndex = 1;


  msg.showAsync();
};

export default askToPurchase;
