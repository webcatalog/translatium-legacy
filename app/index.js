/* global WinJS Windows */

import 'whatwg-fetch';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store from './store';
import renderRoutes from './renderRoutes';

import { isInput, isOutput } from './lib/languageUtils';
import { clearHome, updateInputText } from './actions/home';
import { updateSetting } from './actions/settings';

Windows.UI.WebUI.WebUIApplication.onactivated = (args) => {
  switch (args.kind) {
    case Windows.ApplicationModel.Activation.ActivationKind.protocol: {
      if (args.uri.path === 'translate') {
        const params = (() => {
          const query = args.uri.query.substring(1);
          const result = {};
          query.split('&').forEach(part => {
            const item = part.split('=');
            result[item[0]] = decodeURIComponent(item[1]);
          });
          return result;
        })();

        store.dispatch(clearHome());

        if (params.outputLang && isOutput(params.outputLang)) {
          store.dispatch(updateSetting('outputLang', params.outputLang));
        }
        if (params.inputLang && isInput(params.inputLang)) {
          store.dispatch(updateSetting('inputLang', params.inputLang));
        }
      }
      break;
    }

    case Windows.ApplicationModel.Activation.ActivationKind.shareTarget: {
      const shareOperation = args.shareOperation;
      if (shareOperation.data.contains(
        Windows.ApplicationModel.DataTransfer.StandardDataFormats.text
      )) {
        shareOperation.data.getTextAsync()
          .then(inputText => {
            store.dispatch(updateInputText(inputText));
          });
      }
      break;
    }

    case Windows.ApplicationModel.Activation.ActivationKind.launch: {
      if (args.arguments.substr(0, 13) === 'tile_shortcut') {
        const lang = args.arguments
            .substr(13, args.arguments.length - 13)
            .split('_');
        store.dispatch(updateSetting('inputLang', lang[0]));
        store.dispatch(updateSetting('outputLang', lang[1]));
      }
      break;
    }

    default:
      break;
  }

  render(
    <Provider store={store}>
      {renderRoutes()}
    </Provider>,
    document.getElementById('app')
  );
};
