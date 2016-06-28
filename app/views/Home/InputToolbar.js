/* global Windows */

import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import i18n from '../../i18n';

import { updateInputText, toggleExpanded, switchIme } from '../../actions/home';
import { playInputText } from '../../actions/textToSpeech';
import { initOcr } from '../../actions/ocr';

import {
  isTtsSupported,
  isVoiceRecognitionSupported,
  isHandwritingSupported,
  isOcrSupported,
} from '../../lib/languageUtils';

class InputToolbar extends React.Component {
  constructor(props) {
    super(props);

    this.onPinLanguagePairButtonClick = this.onPinLanguagePairButtonClick.bind(this);
  }

  onPinLanguagePairButtonClick() {
    const { inputLang, outputLang } = this.props;
    const tileId = `${inputLang}_${outputLang}`;

    if (Windows.UI.StartScreen.SecondaryTile.exists(tileId)) {
      const tileToDelete = new Windows.UI.StartScreen.SecondaryTile(tileId);
      return tileToDelete.requestDeleteAsync().then(() => {
        this.forceUpdate();
      }, () => {
        this.forceUpdate();
      });
    }

    const tileActivationArguments = 'tile_shortcut';
    const newTileDisplayName = `${i18n(`/languages/${inputLang}`)} <> `
                             + `${i18n(`/languages/${outputLang}`)}`;

    const square150x150Logo = new Windows.Foundation.Uri('ms-appx:///images/Square150x150.png');
    const wide310x150Logo = new Windows.Foundation.Uri('ms-appx:///images/Wide310x150.png');
    const square310x310Logo = new Windows.Foundation.Uri('ms-appx:///images/Square310x310.png');

    const newTileDesiredLogo = square150x150Logo;
    const newTileDesiredSize = Windows.UI.StartScreen.TileSize.square150x150;
    const tile = new Windows.UI.StartScreen.SecondaryTile(
      tileId,
      newTileDisplayName,
      tileActivationArguments + tileId,
      newTileDesiredLogo,
      newTileDesiredSize
    );
    tile.visualElements.showNameOnSquare150x150Logo = true;
    tile.visualElements.foregroundText = Windows.UI.StartScreen.ForegroundText.light;
    tile.visualElements.showNameOnWide310x150Logo = true;
    tile.visualElements.wide310x150Logo = wide310x150Logo;
    tile.visualElements.showNameOnSquare310x310Logo = true;
    tile.visualElements.square310x310Logo = square310x310Logo;

    return tile.requestCreateAsync().then(() => {
      this.forceUpdate();
    }, () => {
      this.forceUpdate();
    });
  }

  render() {
    const {
      inputLang, outputLang,
      inputExpanded, ttsPlaying,
      onClearButtonClick, onListenButtonClick,
      onExpandButtonClick, onWriteButtonClick,
      onSpeakButtonClick, onCaptureButtonClick, onOpenFromGalleryButtonClick,
    } = this.props;

    const { onPinLanguagePairButtonClick } = this;

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
            icon={ttsPlaying ? '' : ''}
            label={i18n('listen')}
            hidden={!isTtsSupported(inputLang)}
            onClick={onListenButtonClick}
          />
          <ReactWinJS.ToolBar.Button
            key="speak"
            icon="microphone"
            label={i18n('speak')}
            hidden={!isVoiceRecognitionSupported(inputLang)}
            onClick={onSpeakButtonClick}
          />
          <ReactWinJS.ToolBar.Button
            key="write"
            icon=""
            label={i18n('write')}
            hidden={!isHandwritingSupported(inputLang)}
            onClick={onWriteButtonClick}
          />
          <ReactWinJS.ToolBar.Button
            key="capture"
            icon="camera"
            label={i18n('capture')}
            hidden={!isOcrSupported(inputLang)}
            onClick={onCaptureButtonClick}
          />
          <ReactWinJS.ToolBar.Button
            key="openFromGallery"
            icon=""
            label={i18n('open-from-gallery')}
            hidden={!isOcrSupported(inputLang)}
            onClick={onOpenFromGalleryButtonClick}
          />
          <ReactWinJS.ToolBar.Button
            key="expand"
            icon={inputExpanded ? '' : ''}
            label={inputExpanded ? i18n('collapse') : i18n('expand')}
            onClick={onExpandButtonClick}
          />
          <ReactWinJS.ToolBar.Button
            key="pinLanguagePair"
            section="secondary"
            label={
              tileExisted ? i18n('unpin-language-pair')
                          : i18n('pin-language-pair')
            }
            onClick={onPinLanguagePairButtonClick}
          />
        </ReactWinJS.ToolBar>
      </div>
    );
  }
}

InputToolbar.propTypes = {
  inputLang: React.PropTypes.string.isRequired,
  outputLang: React.PropTypes.string.isRequired,
  inputExpanded: React.PropTypes.bool.isRequired,
  ttsPlaying: React.PropTypes.bool.isRequired,
  onClearButtonClick: React.PropTypes.func.isRequired,
  onListenButtonClick: React.PropTypes.func.isRequired,
  onExpandButtonClick: React.PropTypes.func.isRequired,
  onWriteButtonClick: React.PropTypes.func.isRequired,
  onSpeakButtonClick: React.PropTypes.func.isRequired,
  onCaptureButtonClick: React.PropTypes.func.isRequired,
  onOpenFromGalleryButtonClick: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  inputExpanded: state.home.inputExpanded,
  ttsPlaying: state.textToSpeech.ttsPlaying,
});

const mapDispatchToProps = (dispatch) => ({
  onClearButtonClick: () => {
    dispatch(updateInputText(''));
  },
  onListenButtonClick: () => {
    dispatch(playInputText());
  },
  onExpandButtonClick: () => {
    dispatch(toggleExpanded());
  },
  onWriteButtonClick: () => {
    dispatch(switchIme('handwriting'));
  },
  onSpeakButtonClick: () => {
    dispatch(switchIme('speech'));
  },
  onCaptureButtonClick: () => {
    const dialog = new Windows.Media.Capture.CameraCaptureUI();
    dialog.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo)
      .then(file => {
        if (!file) return;
        dispatch(initOcr(file));
        dispatch(push('/ocr'));
      });
  },
  onOpenFromGalleryButtonClick: () => {
    const picker = new Windows.Storage.Pickers.FileOpenPicker();
    picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
    picker.fileTypeFilter.append('.jpg');
    picker.fileTypeFilter.append('.jpeg');
    picker.fileTypeFilter.append('.png');
    picker.pickSingleFileAsync()
      .then(file => {
        if (!file) return;
        dispatch(initOcr(file));
        dispatch(push('/ocr'));
      })
      .then(null, () => {});
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(InputToolbar);
