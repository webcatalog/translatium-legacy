/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import isUrl from './is-url';
import getLocale from './get-locale';

const kits = {
  required: (val, ruleVal, fieldName) => {
    if (!val || val === '') {
      return getLocale('isRequired').replace('{fieldName}', fieldName);
    }

    return null;
  },
  url: (val, maxLength, fieldName) => {
    if (!isUrl(val)) {
      return getLocale('isNotValid').replace('{fieldName}', fieldName);
    }
    return null;
  },
};

const validate = (changes, rules) => {
  const newChanges = { ...changes };

  Object.keys(changes).forEach((key) => {
    let err = null;

    const val = newChanges[key];

    if (rules[key]) {
      const { fieldName } = rules[key];

      Object.keys(rules[key]).find((ruleName) => {
        if (ruleName === 'fieldName') return false;

        const ruleVal = rules[key][ruleName];

        err = kits[ruleName](val, ruleVal, fieldName);

        return err !== null;
      });
    }

    newChanges[`${key}Error`] = err;
  });

  return newChanges;
};

export default validate;
