import isUrl from './is-url';
import isValidLicenseKey from './is-valid-license-key';
import getLocale from './get-locale';

const kits = {
  required: (val, ruleVal, fieldName) => {
    if (!val || val === '') {
      return getLocale('isRequired').replace('$FIELDNAME', fieldName);
    }

    return null;
  },
  url: (val, maxLength, fieldName) => {
    if (!isUrl(val)) {
      return getLocale('isNotValid').replace('$FIELDNAME', fieldName);
    }
    return null;
  },
  licenseKey: (val, ruleVal, fieldName) => {
    if (!isValidLicenseKey(val)) {
      return getLocale('isNotValid').replace('$FIELDNAME', fieldName);
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
