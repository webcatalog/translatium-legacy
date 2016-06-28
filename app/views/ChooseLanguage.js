import React from 'react';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';

import { materialDesignColors } from '../constants/colors';

import i18n from '../i18n';

import {
  getInputLanguages,
  getOutputLanguages,
  getOcrSupportedLanguages,
} from '../lib/languageUtils';

import { updateLanguage } from '../actions/settings';

import Animation from './Animation';

const ChooseLanguage = ({
  location, primaryColorId,
  onLanguageClick,
}) => {
  const { type } = location.query;

  let languages;
  if (type === 'inputLang') languages = getInputLanguages();
  else if (type === 'ocrInputLang') languages = getOcrSupportedLanguages();
  else languages = getOutputLanguages();

  return (
    <Animation name="enterPage">
      <div className="app-choose-a-language-page">
        <div className="app-group-item-container">
          <div
            className="app-group-item win-h4"
            style={{ backgroundColor: materialDesignColors[primaryColorId].light }}
          >
            {i18n('all')}
          </div>
        </div>
        {languages.map(lang => (
          <div
            className="app-item"
            key={lang}
            onClick={() => onLanguageClick(type, lang)}
          >
            <h4 className="win-h4">
              {i18n(`/languages/${lang}`)}
            </h4>
          </div>
          ))}
      </div>
    </Animation>
  );
};

ChooseLanguage.propTypes = {
  location: React.PropTypes.object.isRequired,
  primaryColorId: React.PropTypes.string.isRequired,
  onLanguageClick: React.PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  onLanguageClick: (type, value) => {
    let name = type;
    if (type === 'ocrInputLang') name = 'inputLang';
    if (type === 'ocrOutputLang') name = 'outputLang';

    dispatch(updateLanguage(name, value));
    dispatch(goBack());
  },
});

const mapStateToProps = (state) => ({
  primaryColorId: state.settings.primaryColorId,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(ChooseLanguage);
