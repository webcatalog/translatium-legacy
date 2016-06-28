import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';

import i18n from '../../i18n';

import { playOutputText } from '../../actions/textToSpeech';
import { togglePhrasebook, translate } from '../../actions/home';

import Dictionary from './Dictionary';

const OutputCard = ({
  outputLang,
  status, outputText, outputRoman, phrasebookId,
  ttsPlaying, onListenButtonClick, onPhrasebookButtonClick,
  onTryAgainButtonClick,
}) => {
  if (status === 'failed') {
    return (
      <div style={{ textAlign: 'center', padding: 18 }}>
        <h2 className="win-h2">{i18n('oops')}</h2>
        <h4 className="win-h4">{i18n('connect-problem')}</h4>
        <h5 className="win-h5" style={{ fontWeight: 400, marginTop: 12 }}>
          {i18n('check-connect')}
        </h5>
        <h5 className="win-h5" style={{ fontWeight: 400 }}>
          {i18n('no-connect-china-mode')}
        </h5>
        <button
          className="win-button"
          style={{ marginTop: 12 }}
          onClick={onTryAgainButtonClick}
        >
          {i18n('try-again')}
        </button>
      </div>
    );
  } else if (status === 'loading') {
    return (
      <progress
        className="win-progress-ring win-large"
        style={{ marginLeft: 'calc(50vw - 30px)' }}
      />
    );
  } else if (status === 'successful') {
    return (
      <div>
        <div className="app-card">
          <ReactWinJS.ToolBar>
            <ReactWinJS.ToolBar.Button
              key="listen"
              icon={ttsPlaying ? '' : ''}
              label={i18n('listen')}
              onClick={onListenButtonClick}
            />
            <ReactWinJS.ToolBar.Button
              key="big-text"
              icon=""
              label={i18n('big-text')}
            />
            <ReactWinJS.ToolBar.Button
              key="swap"
              icon=""
              label={i18n('swap')}
            />
            <ReactWinJS.ToolBar.Button
              key="copyToClipboard"
              icon=""
              label={i18n('copy-to-clipboard')}
            />
            <ReactWinJS.ToolBar.Button
              key="share"
              icon=""
              label={i18n('share')}
            />
            <ReactWinJS.ToolBar.Button
              key="addToFavorites"
              icon={(phrasebookId) ? '' : ''}
              label={(phrasebookId) ? i18n('remove-from-phrasebook') : i18n('add-to-phrasebook')}
              onClick={onPhrasebookButtonClick}
            />
          </ReactWinJS.ToolBar>
          <h4
            className="win-h4 app-output-text app-allow-select-text"
            lang={outputLang}
          >
            {outputText}
          </h4>
          {outputRoman ? (
            <h6
              className="win-h6 app-output-roman app-allow-select-text"
              lang={outputLang}
            >
              {outputRoman}
            </h6>
          ) : null}
        </div>
        <Dictionary />
      </div>
    );
  }
  return <div />;
};

OutputCard.propTypes = {
  outputLang: React.PropTypes.string.isRequired,
  status: React.PropTypes.string.isRequired,
  outputText: React.PropTypes.string,
  outputRoman: React.PropTypes.string,
  phrasebookId: React.PropTypes.string,
  ttsPlaying: React.PropTypes.bool.isRequired,
  onListenButtonClick: React.PropTypes.func.isRequired,
  onPhrasebookButtonClick: React.PropTypes.func.isRequired,
  onTryAgainButtonClick: React.PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  onListenButtonClick: () => {
    dispatch(playOutputText());
  },
  onPhrasebookButtonClick: () => {
    dispatch(togglePhrasebook());
  },
  onTryAgainButtonClick: () => {
    dispatch(translate());
  },
});

const mapStateToProps = (state) => ({
  outputLang: state.settings.outputLang,
  status: state.home.status,
  outputText: state.home.outputText,
  outputRoman: state.home.outputRoman,
  phrasebookId: state.home.phrasebookId,
  ttsPlaying: state.textToSpeech.ttsPlaying,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(OutputCard);