/* global Windows */

import i18n from '../i18n';

const showUpgradeDialog = () => {
  const title = i18n('sorry');
  const content = i18n('only-available-in-full-version');
  const msg = new Windows.UI.Popups.MessageDialog(content, title);
  msg.commands.append(
    new Windows.UI.Popups.UICommand(
      i18n('upgrade-now'),
      () => {
        Windows.ApplicationModel.Store.CurrentApp
          .requestAppPurchaseAsync(false)
          .done();
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
