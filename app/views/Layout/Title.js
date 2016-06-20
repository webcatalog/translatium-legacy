import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import i18n from '../../i18n';

const Title = ({
  location, inputLang, outputLang,
  onLanguageClick,
}) => {
  if (location.pathname === '/') {
    return (
      <div>
        <h4
          className="win-h4 app-language-title"
          onClick={() => onLanguageClick('inputLang')}
        >
          {i18n(`/languages/${inputLang}`)}
        </h4>
        <button
          className="win-backbutton app-button app-icon"
          data-icon=""
          disabled
        />
        <h4
          className="win-h4 app-language-title"
          onClick={() => onLanguageClick('outputLang')}
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
    })
  );
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Title);
