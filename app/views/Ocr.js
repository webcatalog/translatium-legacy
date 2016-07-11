/* global Windows */

import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';

import Animation from './Animation';

import i18n from '../i18n';
import openUri from '../openUri';

import { initOcr, toggleShowOriginal } from '../actions/ocr';
import { loadInfo } from '../actions/home';

class Ocr extends React.Component {
  constructor(props) {
    super(props);

    this.onZoomInButtonClick = this.onZoomInButtonClick.bind(this);
    this.onZoomOutButtonClick = this.onZoomOutButtonClick.bind(this);
  }

  componentDidUpdate() {
    const { ocrStatus, imgWidth, imgHeight } = this.props;

    if (ocrStatus === 'translated') {
      const w = (window.innerWidth / imgWidth * 0.9).toFixed(2);
      const h = (window.innerHeight / imgHeight * 0.9).toFixed(2);
      this.refs.zoomContainer.msContentZoomFactor = Math.min(w, h);
    }
  }

  onZoomInButtonClick() {
    this.refs.zoomContainer.msContentZoomFactor += 0.1;
  }

  onZoomOutButtonClick() {
    this.refs.zoomContainer.msContentZoomFactor -= 0.1;
  }

  render() {
    const {
      inputLang,
      ocrStatus, imgHeight, imgWidth, ratio,
      originalText, translatedText,
      originalSegments, translatedSegments, inputFile, showOriginal,
      onCaptureButtonClick, onOpenFromGalleryButtonClick, onTryAgainButtonClick,
      onToggleModeButtonClick, onTextOnlyButtonClick,
    } = this.props;

    const { onZoomInButtonClick, onZoomOutButtonClick } = this;

    return (
      <Animation name="enterPage">
        <div className="app-ocr-page">
          {(() => {
            if (ocrStatus === 'needOcrLang') {
              return (
                <div style={{ textAlign: 'center', padding: 18 }}>
                  <h2 className="win-h2">{i18n('oops')}</h2>
                  <h5 className="win-h5" style={{ marginTop: 12 }}>
                    {i18n('need-language-pack-installed')
                      .replace('{1}', i18n(`/languages/${inputLang}`))}
                  </h5>
                  <button
                    className="win-button"
                    style={{ marginTop: 12 }}
                    onClick={() => openUri('ms-settings:')}
                  >
                    {i18n('open-settings-app')}
                  </button>
                </div>
              );
            }
            if (ocrStatus === 'noTextRecognized') {
              return (
                <div style={{ textAlign: 'center', padding: 18 }}>
                  <h2 className="win-h2">{i18n('oops')}</h2>
                  <h5 className="win-h5" style={{ marginTop: 12 }}>
                    {i18n('no-text-recognized')}
                  </h5>
                  <button
                    className="win-button"
                    style={{ marginTop: 12 }}
                    onClick={onCaptureButtonClick}
                  >
                    {i18n('capture')}
                  </button>
                  <button
                    className="win-button"
                    style={{ marginTop: 12, marginLeft: 12 }}
                    onClick={onOpenFromGalleryButtonClick}
                  >
                    {i18n('open-from-gallery')}
                  </button>
                </div>
              );
            } else if (ocrStatus === 'failedToConnect') {
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
                    onClick={() => onTryAgainButtonClick(inputFile)}
                  >
                    {i18n('try-again')}
                  </button>
                </div>
              );
            } else if (ocrStatus === 'translated') {
              return (
                <div className="app-flex">
                  <div className="app-zoom-container" ref="zoomContainer">
                    <img
                      src={window.URL.createObjectURL(inputFile, { oneTimeOnly: true })}
                      className="app-preview"
                      role="presentation"
                    />
                    <div className="app-text-overlay">
                        {showOriginal === true ? originalSegments.map(line =>
                          line.words.map((word, i) => {
                            const top = `${Math.round(ratio * word.boundingRect.y)}px`;
                            const left = `${Math.round(ratio * word.boundingRect.x)}px`;
                            const fontSize = `${Math.round(ratio * word.boundingRect.height)}px`;

                            return (
                              <div
                                key={`word${i}`}
                                className="win-type-base app-word"
                                style={{ top, left, fontSize }}
                              >
                                {word.text}
                              </div>
                            );
                          })
                        ) : null}
                        {showOriginal === false ? translatedSegments.map((line, i) => {
                          const top = `${Math.round(ratio * line.boundingRect.y)}px`;
                          const left = `${Math.round(ratio * line.boundingRect.x)}px`;
                          const fontSize = `${Math.round(ratio * line.boundingRect.height)}px`;

                          return (
                            <div
                              key={`line${i}`}
                              className="win-type-base app-word"
                              style={{ top, left, fontSize }}
                            >
                              {line.text}
                            </div>
                          );
                        }) : null}
                    </div>
                    <div
                      className="app-bg-overlay"
                      style={{
                        height: imgHeight,
                        width: imgWidth,
                      }}
                    />
                  </div>
                  <ReactWinJS.ToolBar className="app-toolbar">
                    <ReactWinJS.ToolBar.Button
                      key="capture"
                      icon="camera"
                      label={i18n('capture')}
                      onClick={onCaptureButtonClick}
                    />
                    <ReactWinJS.ToolBar.Button
                      key="openFromGallery"
                      icon=""
                      label={i18n('open-from-gallery')}
                      onClick={onOpenFromGalleryButtonClick}
                    />
                    <ReactWinJS.ToolBar.Button
                      key="zoomOut"
                      icon=""
                      label={i18n('zoom-out')}
                      onClick={onZoomOutButtonClick}
                    />
                    <ReactWinJS.ToolBar.Button
                      key="zoomIn"
                      icon=""
                      label={i18n('zoom-in')}
                      onClick={onZoomInButtonClick}
                    />
                    <ReactWinJS.ToolBar.Button
                      key="toggleMode"
                      section="secondary"
                      label={
                        showOriginal === false ? i18n('show-original')
                                                 : i18n('show-translated')
                      }
                      onClick={onToggleModeButtonClick}
                    />
                    <ReactWinJS.ToolBar.Button
                      key="textOnly"
                      section="secondary"
                      label={i18n('text-only')}
                      onClick={() => onTextOnlyButtonClick(originalText, translatedText)}
                    />
                  </ReactWinJS.ToolBar>
                </div>
              );
            }

            return (
              <progress
                className="win-progress-ring win-large"
                style={{
                  marginLeft: 'calc(50vw - 30px)',
                  marginTop: 'calc(50vh - 78px)',
                }}
              />
            );
          })()}
        </div>
      </Animation>
    );
  }
}

Ocr.propTypes = {
  inputLang: React.PropTypes.string.isRequired,
  ocrStatus: React.PropTypes.string,
  imgHeight: React.PropTypes.number,
  imgWidth: React.PropTypes.number,
  ratio: React.PropTypes.number,
  originalText: React.PropTypes.string,
  originalSegments: React.PropTypes.object,
  translatedText: React.PropTypes.string,
  translatedSegments: React.PropTypes.array,
  inputFile: React.PropTypes.object,
  showOriginal: React.PropTypes.bool,
  onCaptureButtonClick: React.PropTypes.func.isRequired,
  onOpenFromGalleryButtonClick: React.PropTypes.func.isRequired,
  onTryAgainButtonClick: React.PropTypes.func.isRequired,
  onToggleModeButtonClick: React.PropTypes.func.isRequired,
  onTextOnlyButtonClick: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  inputLang: state.settings.inputLang,
  ocrStatus: state.ocr.ocrStatus,
  imgHeight: state.ocr.imgHeight,
  imgWidth: state.ocr.imgWidth,
  ratio: state.ocr.ratio,
  originalText: state.ocr.originalText,
  originalSegments: state.ocr.originalSegments,
  translatedText: state.ocr.translatedText,
  translatedSegments: state.ocr.translatedSegments,
  inputFile: state.ocr.inputFile,
  showOriginal: state.ocr.showOriginal,
});

const mapDispatchToProps = (dispatch) => ({
  onCaptureButtonClick: () => {
    const dialog = new Windows.Media.Capture.CameraCaptureUI();
    dialog.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo)
      .then(file => {
        if (!file) return;
        dispatch(initOcr(file));
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
      });
  },
  onTryAgainButtonClick: (file) => {
    dispatch(initOcr(file));
  },
  onToggleModeButtonClick: () => {
    dispatch(toggleShowOriginal());
  },
  onTextOnlyButtonClick: (originalText, translatedText) => {
    dispatch(loadInfo({
      inputText: originalText,
      outputText: translatedText,
    }));
    dispatch(goBack());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Ocr);
