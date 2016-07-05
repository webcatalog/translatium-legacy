/* global Windows */

const resourceNS = Windows.ApplicationModel.Resources.Core;
const resourceMap = resourceNS.ResourceManager.current.mainResourceMap.getSubtree('Resources');
const context = resourceNS.ResourceContext.getForCurrentView();

const i18n = stringId => {
  try {
    return resourceMap.getValue(stringId, context).valueAsString;
  } catch (err) {
    return stringId;
  }
};

export default i18n;
