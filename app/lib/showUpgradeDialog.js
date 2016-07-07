/* global Windows */

import i18n from '../i18n';
import openUri from '../openUri';

const showUpgradeDialog = () => {
  const title = i18n('sorry');
  const content = i18n('only-available-in-full-version');
  const msg = new Windows.UI.Popups.MessageDialog(content, title);
  msg.commands.append(
    new Windows.UI.Popups.UICommand(
      i18n('upgrade-now'),
      () => {
        if (process.env.APP_PROFILE === 'lite') {
          openUri('ms-windows-store://pdp/?ProductId=9wzdncrcsg9k');
        } else {
          Windows.ApplicationModel.Store.CurrentApp
            .requestAppPurchaseAsync(false)
            .done();
        }
      }
    )
  );
  msg.commands.append(
    new Windows.UI.Popups.UICommand(
      i18n('later'),
      () => {}
    )
  );
  msg.showAsync().done();
};

export default showUpgradeDialog;
