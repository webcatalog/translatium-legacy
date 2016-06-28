/* global Windows */

import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import i18n from '../../i18n';

import { playOutputText } from '../../actions/textToSpeech';
import { togglePhrasebook, translate, translateWithInfo } from '../../actions/home';
import shareText from '../../lib/shareText';
import copyToClipboard from '../../lib/copyToClipboard';

import Dictionary from './Dictionary';

import {
  isTtsSupported,
} from '../../lib/languageUtils';

const OutputCard = ({
  inputLang, outputLang, inputText,
  status, outputText, outputRoman, phrasebookId,
  ttsPlaying, onListenButtonClick, onPhrasebookButtonClick,
  onTryAgainButtonClick, onShareButtonClick, onCopyToClipboardClick,
  onSwapButtonClick, onBigTextClick,
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
              hidden={!isTtsSupported(outputLang)}
              onClick={onListenButtonClick}
            />
            <ReactWinJS.ToolBar.Button
              key="big-text"
              icon=""
              label={i18n('big-text')}
              onClick={onBigTextClick}
            />
            <ReactWinJS.ToolBar.Button
              key="swap"
              icon=""
              label={i18n('swap')}
              onClick={() => onSwapButtonClick(inputLang, outputLang, outputText)}
            />
            <ReactWinJS.ToolBar.Button
              key="copyToClipboard"
              icon=""
              label={i18n('copy-to-clipboard')}
              onClick={e => onCopyToClipboardClick(e, inputText, outputText)}
            />
            <ReactWinJS.ToolBar.Button
              key="share"
              icon=""
              label={i18n('share')}
              onClick={e => onShareButtonClick(e, inputText, outputText)}
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
  inputLang: React.PropTypes.string.isRequired,
  outputLang: React.PropTypes.string.isRequired,
  status: React.PropTypes.string.isRequired,
  inputText: React.PropTypes.string,
  outputText: React.PropTypes.string,
  outputRoman: React.PropTypes.string,
  phrasebookId: React.PropTypes.string,
  ttsPlaying: React.PropTypes.bool.isRequired,
  onListenButtonClick: React.PropTypes.func.isRequired,
  onPhrasebookButtonClick: React.PropTypes.func.isRequired,
  onTryAgainButtonClick: React.PropTypes.func.isRequired,
  onShareButtonClick: React.PropTypes.func.isRequired,
  onCopyToClipboardClick: React.PropTypes.func.isRequired,
  onSwapButtonClick: React.PropTypes.func.isRequired,
  onBigTextClick: React.PropTypes.func.isRequired,
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
  onShareButtonClick: (e, inputText, outputText) => {
    const menu = new Windows.UI.Popups.PopupMenu();
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        i18n('original-text'),
        () => shareText(inputText)
      )
    );
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        i18n('translated-text'),
        () => shareText(outputText)
      )
    );
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        i18n('both'),
        () => shareText(`${inputText}\r\n${outputText}`)
      )
    );
    const zoomFactor = document.documentElement.msContentZoomFactor;
    menu.showAsync({
      x: (e.pageX - window.pageXOffset) * zoomFactor,
      y: (e.pageY - window.pageYOffset) * zoomFactor,
    }).done();
  },
  onCopyToClipboardClick: (e, inputText, outputText) => {
    const menu = new Windows.UI.Popups.PopupMenu();
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        i18n('original-text'),
        () => copyToClipboard(inputText)
      )
    );
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        i18n('translated-text'),
        () => copyToClipboard(outputText)
      )
    );
    menu.commands.append(
      new Windows.UI.Popups.UICommand(
        i18n('both'),
        () => copyToClipboard(`${inputText}\r\n${outputText}`)
      )
    );
    const zoomFactor = document.documentElement.msContentZoomFactor;
    menu.showAsync({
      x: (e.pageX - window.pageXOffset) * zoomFactor,
      y: (e.pageY - window.pageYOffset) * zoomFactor,
    }).done();
  },
  onSwapButtonClick: (inputLang, outputLang, outputText) => {
    dispatch(translateWithInfo(outputLang, inputLang, outputText));
  },
  onBigTextClick: () => {
    dispatch(push('/big-text'));
  },
});

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  status: state.home.status,
  inputText: state.home.inputText,
  outputText: state.home.outputText,
  outputRoman: state.home.outputRoman,
  phrasebookId: state.home.phrasebookId,
  ttsPlaying: state.textToSpeech.ttsPlaying,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(OutputCard);
