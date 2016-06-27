import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import i18n from '../../i18n';

import { swapLanguages } from '../../actions/settings';
import { isOutput } from '../../lib/languageUtils';

const Title = ({
  location, inputLang, outputLang,
  onLanguageClick, onSwapButtonClick,
}) => {
  if (location.pathname === '/' || location.pathname === '/ocr') {
    const inputLangType = location.pathname === '/ocr' ? 'ocrInputLang' : 'inputLang';
    const outputLangType = location.pathname === '/ocr' ? 'ocrOutputLang' : 'outputLang';

    return (
      <div>
        <h4
          className="win-h4 app-language-title"
          onClick={() => onLanguageClick(inputLangType)}
        >
          {i18n(`/languages/${inputLang}`)}
        </h4>
        <button
          className="win-backbutton app-button app-icon"
          data-icon=""
          disabled={(isOutput(inputLang) === false)}
          onClick={onSwapButtonClick}
        />
        <h4
          className="win-h4 app-language-title"
          onClick={() => onLanguageClick(outputLangType)}
        >
          {i18n(`/languages/${outputLang}`)}
        </h4>
      </div>
    );
  }

  return (
    <h4 className="win-h4 app-title">
      {i18n(location.pathname.slice(1))}
    </h4>
  );
};

Title.propTypes = {
  location: React.PropTypes.object.isRequired,
  inputLang: React.PropTypes.string.isRequired,
  outputLang: React.PropTypes.string.isRequired,
  onLanguageClick: React.PropTypes.func.isRequired,
  onSwapButtonClick: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
});

const mapDispatchToProps = (dispatch) => ({
  onLanguageClick: (type) => {
    dispatch(push({
      pathname: '/choose-language',
      query: { type },
    }));
  },
  onSwapButtonClick: () => {
    dispatch(swapLanguages());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Title);
