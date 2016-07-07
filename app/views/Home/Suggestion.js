import React from 'react';
import { connect } from 'react-redux';

import replaceWithJSX from '../../lib/replaceWithJSX';

import i18n from '../../i18n';

import { materialDesignColors } from '../../constants/colors';

import { countryRemovedLanguage } from '../../lib/languageUtils';

import { updateInputLang } from '../../actions/settings';
import { updateInputText, translate } from '../../actions/home';

const Suggestion = ({
  inputLang, primaryColorId,
  status, detectedInputLang, suggestedInputText, suggestedInputLang,
  onLanguageClick, onTextClick,
}) => {
  if (status === 'successful') {
    if (inputLang === 'auto') {
      return (
        <div className="app-suggestion win-h5">
          {replaceWithJSX(
            i18n('language-detected'),
            '{1}',
            (<span
              className="app-hl"
              style={{ color: materialDesignColors[primaryColorId].light }}
              onClick={() => onLanguageClick(detectedInputLang)}
              key="detectedInputLang"
            >
                {i18n(`/languages/${detectedInputLang}`)}
            </span>)
          )}
        </div>
      );
    }
    if (suggestedInputText) {
      return (
        <div className="app-suggestion win-h5">
          {replaceWithJSX(
            i18n('did-you-mean'),
            '{1}',
            (<span
              className="app-hl"
              style={{ color: materialDesignColors[primaryColorId].light }}
              onClick={() => onTextClick(suggestedInputText)}
              key="suggestedInputText"
            >
              {suggestedInputText}
            </span>)
          )}
        </div>
      );
    }
    if (
      suggestedInputLang &&
      (countryRemovedLanguage(suggestedInputLang)
      !== countryRemovedLanguage(inputLang))
    ) {
      return (
        <div className="app-suggestion win-h5">
          {replaceWithJSX(
            i18n('translate-from'),
            '{1}',
            (<span
              className="app-hl"
              style={{ color: materialDesignColors[primaryColorId].light }}
              onClick={() => onLanguageClick(suggestedInputLang)}
              key="suggestedInputLang"
            >
              {i18n(`/languages/${suggestedInputLang}`)}
            </span>)
          )}
        </div>
      );
    }
  }
  return null;
};

Suggestion.propTypes = {
  inputLang: React.PropTypes.string.isRequired,
  primaryColorId: React.PropTypes.string.isRequired,
  status: React.PropTypes.string.isRequired,
  detectedInputLang: React.PropTypes.string,
  suggestedInputText: React.PropTypes.string,
  suggestedInputLang: React.PropTypes.string,
  onLanguageClick: React.PropTypes.func.isRequired,
  onTextClick: React.PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  onLanguageClick: (inputLang) => {
    dispatch(updateInputLang(inputLang));
    dispatch(translate());
  },
  onTextClick: (inputText) => {
    dispatch(updateInputText(inputText));
    dispatch(translate());
  },
});

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  primaryColorId: state.settings.primaryColorId,
  status: state.home.status,
  detectedInputLang: state.home.detectedInputLang,
  suggestedInputText: state.home.suggestedInputText,
  suggestedInputLang: state.home.suggestedInputLang,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Suggestion);
