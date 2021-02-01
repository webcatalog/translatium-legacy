/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const os = require('os');

// Big Sur
// https://github.com/microsoft/vscode/pull/110592/files#diff-89c0fca71bfe3e700de17b53b574663b3286ce7550af0d6ce2509216f0f5c801R35
const isMacOs11 = () => {
  const osVersion = os.release();
  return process.platform === 'darwin' && parseFloat(osVersion) >= 20;
};

module.exports = isMacOs11;
