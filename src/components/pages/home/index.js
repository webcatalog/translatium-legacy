/* global Windows ipcRenderer */
import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';

import CircularProgress from '@material-ui/core/CircularProgress';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SvgIcon from '@material-ui/core/SvgIcon';

import ActionSwapHoriz from '@material-ui/icons/SwapHoriz';
import ContentClear from '@material-ui/icons/Clear';
import NavigationMoreVert from '@material-ui/icons/MoreVert';
import ImageCameraAlt from '@material-ui/icons/CameraAlt';
import ImageImage from '@material-ui/icons/Image';
import ContentGesture from '@material-ui/icons/Gesture';
import AVVolumeUp from '@material-ui/icons/VolumeUp';
import AVStop from '@material-ui/icons/Stop';
import AVMic from '@material-ui/icons/Mic';
import SocialShare from '@material-ui/icons/Share';
import EditorFormatSize from '@material-ui/icons/FormatSize';
import ActionSwapVert from '@material-ui/icons/SwapVert';
import ToggleStarBorder from '@material-ui/icons/StarBorder';
import ToggleStar from '@material-ui/icons/Star';
import NavigationFullscreen from '@material-ui/icons/Fullscreen';
import NavigationFullscreenExit from '@material-ui/icons/FullscreenExit';
import Tooltip from '@material-ui/core/Tooltip';

import connectComponent from '../../../helpers/connect-component';

import EnhancedMenu from '../enhanced-menu';

import {
  isOutput,
  isTtsSupported,
  isVoiceRecognitionSupported,
  isHandwritingSupported,
  isOcrSupported,
  toCountryRemovedLanguage,
} from '../../../helpers/language-utils';

import { loadImage } from '../../../state/pages/ocr/actions';
import { playTextToSpeech, stopTextToSpeech } from '../../../state/pages/home/text-to-speech/actions';
import { openSnackbar } from '../../../state/root/snackbar/actions';
import {
  swapLanguages,
  updateInputLang,
  updateOutputLang,
} from '../../../state/root/settings/actions';
import {
  insertInputText,
  toggleFullscreenInputBox,
  togglePhrasebook,
  translate,
  updateImeMode,
  updateInputText,
} from '../../../state/pages/home/actions';

import getPlatform from '../../../helpers/get-platform';
import copyToClipboard from '../../../helpers/copy-to-clipboard';
import pasteFromClipboardAsync from '../../../helpers/paste-from-clipboard-async';
import shareText from '../../../helpers/share-text';


import Dictionary from './dictionary';
import Handwriting from './handwriting';
import Speech from './speech';
import History from './history';

const styles = theme => ({
  container: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.palette.background.contentFrame,
  },
  anotherContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  inputContainer: {
    flex: '0 1 140px',
    height: 140,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transition: 'flex 0.5s',
  },
  inputContainerFullScreen: {
    flex: 1,
    height: '100%',
  },
  textarea: {
    border: 0,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    outline: 0,
    margin: 0,
    padding: 12,
    fontSize: 16,
    boxSizing: 'border-box',
    flex: 1,
  },
  controllerContainer: {
    flexBasis: 48,
    paddingLeft: 8,
    paddingRight: 8,
    boxSizing: 'border-box',
    borderTop: `1px solid ${theme.palette.text.disabled}`,
  },
  controllerContainerLeft: {
    float: 'left',
  },
  controllerContainerRight: {
    float: 'right',
    paddingTop: 6,
  },
  resultContainer: {
    flex: 1,
    padding: '0 12px 12px 12px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  resultContainerHidden: {
    flex: 0,
  },
  progressContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outputCard: {
    marginTop: 12,
  },
  languageTitle: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: 21,
    textTransform: 'none',
    fontWeight: 500,
  },
  googleCopyright: {
    color: theme.palette.text.disabled,
  },
  inputRoman: {
    marginTop: 8,
  },
  suggestion: {
    marginTop: 8,
  },
});

class Home extends React.Component {
  componentDidMount() {
    if (getPlatform() === 'windows') {
      const { preventScreenLock } = this.props;
      if (preventScreenLock === true) {
        this.dispRequest = new Windows.System.Display.DisplayRequest();
        this.dispRequest.requestActive();
      }
    }

    const {
      onAnotherContainerClick,
      onCameraButtonClick,
      onClearButtonClick,
      onLanguageClick,
      onListenButtonClick,
      onOpenImageButtonClick,
      onSpeakButtonClick,
      onSwapButtonClick,
      onTogglePhrasebookClick,
      onWriteButtonClick,
      onUpdateInputText,

      cameraShortcut,
      clearInputShortcut,
      drawShortcut,
      listenShortcut,
      openImageFileShortcut,
      openInputLangListShortcut,
      openOutputLangListShortcut,
      saveToPhrasebookShortcut,
      speakShorcut,
      swapLanguagesShortcut,
    } = this.props;

    if (getPlatform() === 'electron') {
      ipcRenderer.on('set-input-text', (e, text) => {
        onUpdateInputText(text);
      });
    }

    Mousetrap.bind(openInputLangListShortcut, (e) => {
      e.preventDefault();

      onLanguageClick('inputLang');
    });

    Mousetrap.bind(openOutputLangListShortcut, (e) => {
      e.preventDefault();

      onLanguageClick('outputLang');
    });

    Mousetrap.bind(swapLanguagesShortcut, (e) => {
      e.preventDefault();

      onSwapButtonClick();
    });

    Mousetrap.bind(clearInputShortcut, (e) => {
      e.preventDefault();
      onClearButtonClick();
    });

    Mousetrap.bind(speakShorcut, (e) => {
      e.preventDefault();

      const { imeMode, inputLang } = this.props;
      if (imeMode === 'speech') {
        onAnotherContainerClick(imeMode);
        return;
      }

      if (isVoiceRecognitionSupported(inputLang)) {
        onSpeakButtonClick();
      }
    });

    Mousetrap.bind(listenShortcut, (e) => {
      e.preventDefault();

      const {
        inputLang,
        textToSpeechPlaying,
        output,
      } = this.props;
      if (isTtsSupported(inputLang)) {
        onListenButtonClick(textToSpeechPlaying, output.outputLang, output.outputText);
      }
    });

    Mousetrap.bind(drawShortcut, (e) => {
      e.preventDefault();

      const { chinaMode, imeMode, inputLang } = this.props;

      if (imeMode === 'handwriting') {
        onAnotherContainerClick(imeMode);
        return;
      }

      if (isHandwritingSupported(inputLang) && !chinaMode) {
        onWriteButtonClick();
      }
    });

    Mousetrap.bind(cameraShortcut, (e) => {
      e.preventDefault();

      const { inputLang } = this.props;

      if (isOcrSupported(inputLang)) {
        onCameraButtonClick();
      }
    });

    Mousetrap.bind(openImageFileShortcut, (e) => {
      e.preventDefault();

      const { inputLang } = this.props;

      if (isOcrSupported(inputLang)) {
        onOpenImageButtonClick();
      }
    });

    Mousetrap.bind(saveToPhrasebookShortcut, (e) => {
      e.preventDefault();

      const { output } = this.props;

      if (output && !output.phrasebookId) {
        onTogglePhrasebookClick();
      }
    });
  }
  componentWillUnmount() {
    const {
      cameraShortcut,
      clearInputShortcut,
      drawShortcut,
      listenShortcut,
      openImageFileShortcut,
      openInputLangListShortcut,
      openOutputLangListShortcut,
      saveToPhrasebookShortcut,
      speakShorcut,
      swapLanguagesShortcut,
    } = this.props;

    if (getPlatform() === 'windows') {
      if (this.dispRequest) {
        this.dispRequest.requestRelease();
      }
    }

    Mousetrap.unbind([
      cameraShortcut,
      clearInputShortcut,
      drawShortcut,
      listenShortcut,
      openImageFileShortcut,
      openInputLangListShortcut,
      openOutputLangListShortcut,
      saveToPhrasebookShortcut,
      speakShorcut,
      swapLanguagesShortcut,
    ]);
  }

  renderOutput() {
    const {
      classes,
      fullscreenInputBox,
      onBiggerTextButtonClick,
      onListenButtonClick,
      onRequestCopyToClipboard,
      onSuggestedInputLangClick,
      onSuggestedInputTextClick,
      onSwapOutputButtonClick,
      onTogglePhrasebookClick,
      output,
      screenWidth,
      strings,
      textToSpeechPlaying,
    } = this.props;

    if (fullscreenInputBox === true) {
      return null;
    }

    if (!output) return <History />;

    switch (output.status) {
      case 'loading': {
        return (
          <div className={classes.progressContainer} >
            <CircularProgress size={80} />
          </div>
        );
      }
      default: {
        const controllers = [
          {
            icon: output.phrasebookId ? <ToggleStar /> : <ToggleStarBorder />,
            tooltip: output.phrasebookId ? strings.removeFromPhrasebook : strings.addToPhrasebook,
            onClick: onTogglePhrasebookClick,
          },
          {
            icon: <ActionSwapVert />,
            tooltip: strings.swap,
            onClick: () => onSwapOutputButtonClick(
              output.outputLang,
              output.inputLang,
              output.outputText,
            ),
          },
          {
            icon: <EditorFormatSize />,
            tooltip: strings.biggerText,
            onClick: () => onBiggerTextButtonClick(output.outputText),
          },
          {
            icon: (
              <SvgIcon>
                <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
              </SvgIcon>
            ),
            tooltip: strings.copy,
            onClick: () => onRequestCopyToClipboard(output.outputText, strings),
          },
        ];

        if (isTtsSupported(output.outputLang)) {
          controllers.unshift({
            icon: textToSpeechPlaying ? <AVStop /> : <AVVolumeUp />,
            tooltip: textToSpeechPlaying ? strings.stop : strings.listen,
            onClick: () =>
              onListenButtonClick(
                textToSpeechPlaying,
                output.outputLang,
                output.outputText,
              ),
          });
        }

        if (getPlatform() !== 'electron') {
          controllers.push({
            icon: <SocialShare />,
            tooltip: strings.share,
            onClick: () => {
              shareText(output.outputText);
            },
          });
        }

        const maxVisibleIcon = Math.min(Math.round((screenWidth - 120) / 56), controllers.length);
        const showMoreButton = (maxVisibleIcon < controllers.length);

        const hasDict = output.inputDict !== undefined && output.outputDict !== undefined;

        return (
          <div
            className={classNames(
              classes.resultContainer,
              { [classes.resultContainerHidden]: fullscreenInputBox },
            )}
          >
            {output.inputRoman && (
              <Typography
                variant="body1"
                className={classNames('text-selectable', classes.inputRoman)}
              >
                {output.inputRoman}
              </Typography>
            )}

            {output.suggestedInputLang && (
              <Typography
                variant="body1"
                align="left"
                className={classes.suggestion}
              >
                <span role="img" aria-label="">💡</span>
                <span>{strings.translateFrom}:&#32;</span>
                <a
                  role="button"
                  tabIndex={0}
                  onClick={() => onSuggestedInputLangClick(output.suggestedInputLang)}
                >
                  {strings[output.suggestedInputLang]}
                </a>
                <span>&#32;?&#32;</span>
              </Typography>
            )}

            {output.suggestedInputText && (
              <Typography
                variant="body1"
                align="left"
                className={classes.suggestion}
              >
                <span role="img" aria-label="">💡</span>
                <span>{strings.didYouMean}:&#32;</span>
                <a
                  role="button"
                  tabIndex={0}
                  onClick={() => onSuggestedInputTextClick(output.suggestedInputText)}
                >
                  {output.suggestedInputText}
                </a>
                <span>&#32;?&#32;</span>
              </Typography>
            )}

            <Card className={classes.outputCard}>
              <CardContent className="text-selectable">
                <Typography
                  variant="headline"
                  lang={toCountryRemovedLanguage(output.outputLang)}
                  className="text-selectable"
                >
                  {output.outputText}
                </Typography>

                {output.outputRoman && (
                  <Typography variant="body1" className={classNames('text-selectable', classes.pos)}>
                    {output.outputRoman}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                {controllers.slice(0, maxVisibleIcon).map(({ icon, tooltip, onClick }) => (
                  <Tooltip title={tooltip} placement="bottom" key={`outputTool_${tooltip}`}>
                    <IconButton
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      {icon}
                    </IconButton>
                  </Tooltip>
                ))}
                {showMoreButton && (
                  <EnhancedMenu
                    id="homeMore2"
                    buttonElement={(
                      <IconButton aria-label={strings.more} tooltipPosition="bottom-center">
                        <NavigationMoreVert />
                      </IconButton>
                    )}
                    anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                  >
                    {
                      controllers
                        .slice(maxVisibleIcon, controllers.length)
                        .map(({ icon, tooltip, onClick }) => (
                          <ListItem button onClick={onClick} key={`outputTool_${tooltip}`}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText primary={tooltip} />
                          </ListItem>
                        ))
                    }
                  </EnhancedMenu>
                )}
              </CardActions>
            </Card>
            {hasDict && <Dictionary output={output} />}
            <Typography
              variant="body2"
              align="right"
              className={classes.googleCopyright}
            >
              {strings.translatedByGoogle}
            </Typography>
          </div>
        );
      }
    }
  }

  render() {
    const {
      chinaMode,
      classes,
      fullscreenInputBox,
      imeMode,
      inputLang,
      inputText,
      onAnotherContainerClick,
      onCameraButtonClick,
      onClearButtonClick,
      onFullscreenButtonClick,
      onInsertText,
      onKeyDown, onInputText,
      onLanguageClick,
      onListenButtonClick,
      onOpenImageButtonClick,
      onSpeakButtonClick,
      onSwapButtonClick,
      onTranslateButtonClick,
      onWriteButtonClick,
      outputLang,
      screenWidth,
      strings,
      textToSpeechPlaying,
      translateWhenPressingEnter,
    } = this.props;

    const controllers = [
      {
        icon: (
          <SvgIcon>
            <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z" />
          </SvgIcon>
        ),
        tooltip: strings.pasteFromClipboard,
        onClick: () => {
          pasteFromClipboardAsync()
            .then((text) => {
              onInsertText(text);
            })
            .catch((err) => {
              // eslint-disable-next-line
              console.log(err);
            });
        },
      },
      {
        icon: <ContentClear />,
        tooltip: strings.clear,
        onClick: onClearButtonClick,
      },
    ];

    if (isTtsSupported(inputLang)) {
      controllers.push({
        icon: textToSpeechPlaying ? <AVStop /> : <AVVolumeUp />,
        tooltip: textToSpeechPlaying ? strings.stop : strings.listen,
        onClick: () => onListenButtonClick(textToSpeechPlaying, inputLang, inputText),
      });
    }

    if (isVoiceRecognitionSupported(inputLang)) {
      controllers.push({
        icon: <AVMic />,
        tooltip: strings.speak,
        onClick: onSpeakButtonClick,
      });
    }

    if (isHandwritingSupported(inputLang) && !chinaMode) {
      controllers.push({
        icon: <ContentGesture />,
        tooltip: strings.draw,
        onClick: onWriteButtonClick,
      });
    }

    if (isOcrSupported(inputLang)) {
      controllers.push({
        icon: <ImageImage />,
        tooltip: strings.openImageFile,
        onClick: onOpenImageButtonClick,
      });
    }

    controllers.push({
      icon: fullscreenInputBox ? <NavigationFullscreenExit /> : <NavigationFullscreen />,
      tooltip: fullscreenInputBox ? strings.exitFullscreen : strings.fullscreen,
      onClick: onFullscreenButtonClick,
    });

    if (getPlatform() !== 'electron') {
      if (isOcrSupported(inputLang)) {
        controllers.splice(controllers.length - 2, 0, {
          icon: <ImageCameraAlt />,
          tooltip: strings.camera,
          onClick: onCameraButtonClick,
        });
      }
    }

    const maxVisibleIcon = Math.min(Math.round((screenWidth - 200) / 56), controllers.length);

    const showMoreButton = (maxVisibleIcon < controllers.length);

    return (
      <div className={classes.container}>
        <div
          className={classes.anotherContainer}
          role="presentation"
          onClick={() => onAnotherContainerClick(imeMode)}
        >
          <AppBar position="static">
            <Toolbar>
              <Button
                color="inherit"
                className={classes.languageTitle}
                onClick={() => onLanguageClick('inputLang')}
              >
                {strings[inputLang]}
              </Button>
              <Tooltip title={strings.swap} placement="bottom">
                <div>
                  <IconButton
                    color="inherit"
                    disabled={!isOutput(inputLang)}
                    onClick={onSwapButtonClick}
                  >
                    <ActionSwapHoriz />
                  </IconButton>
                </div>
              </Tooltip>
              <Button
                color="inherit"
                className={classes.languageTitle}
                onClick={() => onLanguageClick('outputLang')}
              >
                {strings[outputLang]}
              </Button>
            </Toolbar>
          </AppBar>
          <Paper
            elevation={2}
            className={classNames(
              classes.inputContainer,
              { [classes.inputContainerFullScreen]: fullscreenInputBox },
            )}
          >
            <textarea
              className={classNames('mousetrap', 'text-selectable', classes.textarea)}
              lang={toCountryRemovedLanguage(inputLang)}
              placeholder={strings.typeSomethingHere}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onKeyDown={translateWhenPressingEnter ? e => onKeyDown(e) : null}
              onInput={onInputText}
              onKeyUp={onInputText}
              onClick={onInputText}
              onChange={onInputText}
              value={inputText}
            />
            <div className={classes.controllerContainer}>
              <div className={classes.controllerContainerLeft}>
                {controllers.slice(0, maxVisibleIcon).map(({ icon, tooltip, onClick }) => (
                  <Tooltip title={tooltip} placement={fullscreenInputBox ? 'top' : 'bottom'} key={`inputTool_${tooltip}`}>
                    <IconButton
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      {icon}
                    </IconButton>
                  </Tooltip>
                ))}
                {showMoreButton && (
                  <EnhancedMenu
                    id="homeMore"
                    buttonElement={(
                      <IconButton aria-label={strings.more}>
                        <NavigationMoreVert />
                      </IconButton>
                    )}
                  >
                    {
                      controllers
                        .slice(maxVisibleIcon, controllers.length)
                        .map(({ icon, tooltip, onClick }) => (
                          <ListItem button onClick={onClick} key={`inputTool_${tooltip}`}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText primary={tooltip} />
                          </ListItem>
                        ))
                    }
                  </EnhancedMenu>
                )}
              </div>
              <div className={classes.controllerContainerRight}>
                <Tooltip title={strings.andSaveToHistory} placement={fullscreenInputBox ? 'top' : 'bottom'}>
                  <Button variant="raised" color="primary" onClick={onTranslateButtonClick}>
                    {strings.translate}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Paper>
          {this.renderOutput()}
        </div>
        {imeMode === 'handwriting' ? <Handwriting /> : null}
        {imeMode === 'speech' ? <Speech /> : null}
      </div>
    );
  }
}

Home.propTypes = {
  chinaMode: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  fullscreenInputBox: PropTypes.bool,
  imeMode: PropTypes.string,
  inputLang: PropTypes.string,
  inputText: PropTypes.string,
  onAnotherContainerClick: PropTypes.func.isRequired,
  onBiggerTextButtonClick: PropTypes.func.isRequired,
  onCameraButtonClick: PropTypes.func.isRequired,
  onClearButtonClick: PropTypes.func.isRequired,
  onFullscreenButtonClick: PropTypes.func.isRequired,
  onInputText: PropTypes.func.isRequired,
  onInsertText: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onLanguageClick: PropTypes.func.isRequired,
  onListenButtonClick: PropTypes.func.isRequired,
  onOpenImageButtonClick: PropTypes.func.isRequired,
  onRequestCopyToClipboard: PropTypes.func.isRequired,
  onSpeakButtonClick: PropTypes.func.isRequired,
  onSuggestedInputLangClick: PropTypes.func.isRequired,
  onSuggestedInputTextClick: PropTypes.func.isRequired,
  onSwapButtonClick: PropTypes.func.isRequired,
  onSwapOutputButtonClick: PropTypes.func.isRequired,
  onTogglePhrasebookClick: PropTypes.func.isRequired,
  onTranslateButtonClick: PropTypes.func.isRequired,
  onWriteButtonClick: PropTypes.func.isRequired,
  onUpdateInputText: PropTypes.func.isRequired,
  output: PropTypes.object,
  outputLang: PropTypes.string,
  preventScreenLock: PropTypes.bool,
  screenWidth: PropTypes.number,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  textToSpeechPlaying: PropTypes.bool,
  translateWhenPressingEnter: PropTypes.bool,

  cameraShortcut: PropTypes.string.isRequired,
  clearInputShortcut: PropTypes.string.isRequired,
  drawShortcut: PropTypes.string.isRequired,
  listenShortcut: PropTypes.string.isRequired,
  openImageFileShortcut: PropTypes.string.isRequired,
  openInputLangListShortcut: PropTypes.string.isRequired,
  openOutputLangListShortcut: PropTypes.string.isRequired,
  saveToPhrasebookShortcut: PropTypes.string.isRequired,
  speakShorcut: PropTypes.string.isRequired,
  swapLanguagesShortcut: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  screenWidth: state.screen.screenWidth,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
  preventScreenLock: state.settings.preventingScreenLock,
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  inputText: state.pages.home.inputText,
  output: state.pages.home.output,
  imeMode: state.pages.home.imeMode,
  textToSpeechPlaying: state.pages.home.textToSpeech.textToSpeechPlaying,
  fullscreenInputBox: state.pages.home.fullscreenInputBox,
  chinaMode: state.settings.chinaMode,
  strings: state.strings,

  cameraShortcut: state.settings.cameraShortcut,
  clearInputShortcut: state.settings.clearInputShortcut,
  drawShortcut: state.settings.drawShortcut,
  listenShortcut: state.settings.listenShortcut,
  openImageFileShortcut: state.settings.openImageFileShortcut,
  openInputLangListShortcut: state.settings.openInputLangListShortcut,
  openOnMenubarShortcut: state.settings.openOnMenubarShortcut,
  openOutputLangListShortcut: state.settings.openOutputLangListShortcut,
  saveToPhrasebookShortcut: state.settings.saveToPhrasebookShortcut,
  speakShorcut: state.settings.speakShorcut,
  swapLanguagesShortcut: state.settings.swapLanguagesShortcut,
});

const mapDispatchToProps = dispatch => ({
  onLanguageClick: type =>
    dispatch(push({
      pathname: '/language-list',
      query: { type },
    })),
  onSwapButtonClick: () => dispatch(swapLanguages()),
  onKeyDown: (e) => {
    if (e.key === 'Enter') {
      dispatch(translate(true));
      e.target.blur();
    }

    const inputText = e.target.value;

    dispatch(updateInputText(inputText, e.target.selectionStart, e.target.selectionEnd));
  },
  onInputText: (e) => {
    const inputText = e.target.value;

    dispatch(updateInputText(inputText, e.target.selectionStart, e.target.selectionEnd));
  },
  onUpdateInputText: (inputText) => {
    dispatch(updateInputText(inputText, 0, 0));
  },
  onClearButtonClick: () => dispatch(updateInputText('')),
  onInsertText: text => dispatch(insertInputText(text)),
  onListenButtonClick: (toStop, lang, text) => {
    if (toStop) {
      dispatch(stopTextToSpeech());
      return;
    }
    dispatch(playTextToSpeech(lang, text));
  },
  onTranslateButtonClick: () => dispatch(translate(true)),
  onWriteButtonClick: () => dispatch(updateImeMode('handwriting')),
  onSpeakButtonClick: () => dispatch(updateImeMode('speech')),
  onTogglePhrasebookClick: () => dispatch(togglePhrasebook()),
  onOpenImageButtonClick: () => dispatch(loadImage(false)),
  onCameraButtonClick: () => dispatch(loadImage(true)),
  onSwapOutputButtonClick: (inputLang, outputLang, inputText) => {
    dispatch(updateInputLang(inputLang));
    dispatch(updateOutputLang(outputLang));
    dispatch(updateInputText(inputText));
  },
  onBiggerTextButtonClick: text =>
    dispatch(push({
      pathname: '/bigger-text',
      query: { text },
    })),
  onFullscreenButtonClick: () => dispatch(toggleFullscreenInputBox()),
  onSuggestedInputLangClick: value => dispatch(updateInputLang(value)),
  onSuggestedInputTextClick: text => dispatch(updateInputText(text)),
  onAnotherContainerClick: (imeMode) => {
    if (imeMode) dispatch(updateImeMode(null));
  },
  onRequestCopyToClipboard: (text, strings) => {
    copyToClipboard(text);
    dispatch(openSnackbar(strings.copied));
  },
});

export default connectComponent(
  Home,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
