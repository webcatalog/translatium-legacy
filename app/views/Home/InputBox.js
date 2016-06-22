import React from 'react';
import { connect } from 'react-redux';

import { materialDesignColors } from '../../constants/colors';

import i18n from '../../i18n';

import { updateInputText, translate } from '../../actions/home';

const InputBox = ({
  inputLang, primaryColorId,
  inputText, onInputText,
  onTranslateButtonClick,
}) => {
  const translateButtonDisabled = inputText.trim().length < 1;
  return (
    <div className="app-input-container">
      <textarea
        spellCheck={false}
        placeholder={i18n('type-something-here')}
        className="win-textarea app-textarea"
        lang={inputLang}
        onInput={onInputText}
        value={inputText}
      />
      <button
        className="win-button app-translate-button"
        style={
          (!translateButtonDisabled) ? {
            backgroundColor: materialDesignColors[primaryColorId].light,
            color: '#fff',
          } : null
        }
        disabled={translateButtonDisabled}
        onClick={onTranslateButtonClick}
      >
        {i18n('translate')}
      </button>
    </div>
  );
};

InputBox.propTypes = {
  inputLang: React.PropTypes.string.isRequired,
  primaryColorId: React.PropTypes.string.isRequired,
  inputText: React.PropTypes.string.isRequired,
  onInputText: React.PropTypes.func.isRequired,
  onTranslateButtonClick: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  primaryColorId: state.settings.primaryColorId,
  inputText: state.home.inputText,
});

const mapDispatchToProps = (dispatch) => ({
  onInputText: (e) => {
    const inputText = e.target.value;
    dispatch(updateInputText(inputText));
  },
  onTranslateButtonClick: () => {
    dispatch(translate());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(InputBox);
