import React from 'react';
import { connect } from 'react-redux';

import i18n from '../../i18n';

const Title = ({ location, inputLang, outputLang }) => {
  if (location.pathname === '/') {
    return (
      <div>
        <h4 className="win-h4 app-language-title">
          {i18n(`/languages/${inputLang}`)}
        </h4>
        <button
          className="win-backbutton app-button app-icon"
          data-icon=""
          disabled
        />
        <h4 className="win-h4 app-language-title">
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
};

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
});

export default connect(
  mapStateToProps
)(Title);
