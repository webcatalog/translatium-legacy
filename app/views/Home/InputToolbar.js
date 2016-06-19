/* global Windows */

import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';

import i18n from '../../i18n';

import { clearHome } from '../../actions/home';

const InputToolbar = ({
  inputLang, outputLang,
  inputExpanded,
  onClearButtonClick,
}) => {
  const tileExisted = Windows.UI.StartScreen.SecondaryTile.exists(
    `${inputLang}_${outputLang}`
  );

  return (
    <div className="app-toolbar-container">
      <ReactWinJS.ToolBar>
        <ReactWinJS.ToolBar.Button
          key="clearAll"
          icon=""
          label={i18n('clear-all')}
          onClick={onClearButtonClick}
        />
        <ReactWinJS.ToolBar.Button
          key="listen"
          icon=""
          label={i18n('listen')}
        />
        <ReactWinJS.ToolBar.Button
          key="speak"
          icon="microphone"
          label={i18n('speak')}
        />
        <ReactWinJS.ToolBar.Button
          key="write"
          icon=""
          label={i18n('write')}
        />
        <ReactWinJS.ToolBar.Button
          key="capture"
          icon="camera"
          label={i18n('capture')}
        />
        <ReactWinJS.ToolBar.Button
          key="openFromGallery"
          icon=""
          label={i18n('open-from-gallery')}
        />
        <ReactWinJS.ToolBar.Button
          key="expand"
          icon={inputExpanded ? '' : ''}
          label={inputExpanded ? i18n('collapse') : i18n('expand')}
        />
        <ReactWinJS.ToolBar.Button
          key="pinLanguagePair"
          section="secondary"
          label={
            tileExisted ? i18n('unpin-language-pair')
                        : i18n('pin-language-pair')
          }
        />
      </ReactWinJS.ToolBar>
    </div>
  );
};

InputToolbar.propTypes = {
  inputLang: React.PropTypes.string.isRequired,
  outputLang: React.PropTypes.string.isRequired,
  inputExpanded: React.PropTypes.bool.isRequired,
  onClearButtonClick: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  inputExpanded: state.home.inputExpanded,
});

const mapDispatchToProps = (dispatch) => ({
  onClearButtonClick: () => {
    dispatch(clearHome());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(InputToolbar);
