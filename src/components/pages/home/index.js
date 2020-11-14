/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import SvgIcon from '@material-ui/core/SvgIcon';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AVStop from '@material-ui/icons/Stop';
import AVVolumeUp from '@material-ui/icons/VolumeUp';
import ActionSwapHoriz from '@material-ui/icons/SwapHoriz';
import ActionSwapVert from '@material-ui/icons/SwapVert';
import ContentClear from '@material-ui/icons/Clear';
import ImageImage from '@material-ui/icons/Image';
import NavigationFullscreen from '@material-ui/icons/Fullscreen';
import NavigationFullscreenExit from '@material-ui/icons/FullscreenExit';
import ToggleStar from '@material-ui/icons/Star';
import ToggleStarBorder from '@material-ui/icons/StarBorder';
import Tooltip from '@material-ui/core/Tooltip';
import FileCopy from '@material-ui/icons/FileCopy';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import {
  isOcrSupported,
  isTTSSupported,
} from '../../../helpers/language-utils';

import { loadImage } from '../../../state/pages/ocr/actions';
import { openSnackbar } from '../../../state/root/snackbar/actions';
import { changeRoute } from '../../../state/root/router/actions';
import {
  swapLanguages,
  updateInputLang,
  updateOutputLang,
} from '../../../state/root/preferences/actions';
import {
  toggleFullscreenInputBox,
  togglePhrasebook,
  translate,
  updateInputText,
} from '../../../state/pages/home/actions';
import {
  startTextToSpeech,
  endTextToSpeech,
} from '../../../state/pages/home/text-to-speech/actions';
import { updateLanguageListMode } from '../../../state/pages/language-list/actions';

import { ROUTE_LANGUAGE_LIST } from '../../../constants/routes';

import Dictionary from './dictionary';
import History from './history';
import RatingCard from './rating-card';

const styles = (theme) => ({
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
    ...theme.typography.body1,
    border: 0,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    outline: 0,
    margin: 0,
    padding: theme.spacing(1.5),
    boxSizing: 'border-box',
    flex: 1,
    resize: 'none',
  },
  controllerContainer: {
    flexBasis: 40,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    boxSizing: 'border-box',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  controllerContainerLeft: {
    paddingTop: 2,
    float: 'left',
  },
  controllerContainerRight: {
    float: 'right',
    paddingTop: 5,
  },
  controllerIconButton: {
    padding: theme.spacing(1),
  },
  resultContainer: {
    flex: 1,
    paddingBottom: theme.spacing(1.5),
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
  languageTitle: {
    flex: 1,
  },
  languageTitleLabel: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: 14,
    textTransform: 'none',
    fontWeight: 400,
    display: 'inline-block',
  },
  appBarColorDefault: {
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
  },
  translateButtonLabel: {
    fontWeight: 500,
  },
  outputActions: {
    padding: theme.spacing(0, 1, 0.5, 1),
  },
  inputRoman: {
    ...theme.typography.body2,
    padding: '0 12px',
    marginBottom: 12,
    whiteSpace: 'pre-wrap',
  },
  card: {
    borderTop: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
  },
  toolbar: {
    minHeight: 40,
    paddingRight: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
  },
  toolbarIconButton: {
    padding: theme.spacing(1),
  },
  outputText: {
    whiteSpace: 'pre-wrap',
  },
});

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.handleOpenFind = this.handleOpenFind.bind(this);
  }

  componentDidMount() {
    if (this.inputRef && this.inputRef.current) {
      this.inputRef.current.focus();
    }

    window.ipcRenderer.on('open-find', this.handleOpenFind);
  }

  componentWillUnmount() {
    window.ipcRenderer.removeListener('open-find', this.handleOpenFind);
  }

  handleOpenFind() {
    this.inputRef.current.focus();
    this.inputRef.current.select();
  }

  renderOutput() {
    const {
      classes,
      fullscreenInputBox,
      onEndTextToSpeech,
      onOpenSnackbar,
      onStartTextToSpeech,
      onTogglePhrasebook,
      onTranslate,
      onUpdateInputLang,
      onUpdateInputText,
      onUpdateOutputLang,
      output,
      showTransliteration,
      textToSpeechPlaying,
    } = this.props;

    if (fullscreenInputBox === true) {
      return null;
    }

    if (!output) return <History />;

    switch (output.status) {
      case 'loading': {
        return (
          <div className={classes.progressContainer}>
            <CircularProgress size={80} />
          </div>
        );
      }
      default: {
        const controllers = [
          {
            Icon: output.phrasebookId ? ToggleStar : ToggleStarBorder,
            tooltip: output.phrasebookId ? getLocale('removeFromPhrasebook') : getLocale('addToPhrasebook'),
            onClick: onTogglePhrasebook,
          },
          {
            Icon: ActionSwapVert,
            tooltip: getLocale('swap'),
            onClick: () => {
              onUpdateInputLang(output.outputLang);
              onUpdateOutputLang(output.inputLang);
              onUpdateInputText(output.outputText);
              onTranslate(output.outputLang, output.inputLang, output.outputText);
            },
          },
          {
            Icon: FileCopy,
            tooltip: getLocale('copy'),
            onClick: () => {
              window.remote.clipboard.writeText(output.outputText);
              onOpenSnackbar(getLocale('copied'));
            },
          },
        ];

        if (isTTSSupported(output.outputLang)) {
          controllers.unshift({
            Icon: textToSpeechPlaying ? AVStop : AVVolumeUp,
            tooltip: textToSpeechPlaying ? getLocale('stop') : getLocale('listen'),
            onClick: () => {
              if (textToSpeechPlaying) {
                return onEndTextToSpeech();
              }

              return onStartTextToSpeech(
                output.outputLang,
                output.outputText,
              );
            },
          });
        }

        return (
          <div
            className={classNames(
              classes.resultContainer,
              { [classes.resultContainerHidden]: fullscreenInputBox },
            )}
          >
            {showTransliteration && output.inputRoman && (
              <Typography
                variant="body2"
                color="textSecondary"
                className={classNames('text-selectable', classes.inputRoman)}
              >
                {output.inputRoman}
              </Typography>
            )}
            <Card elevation={0} square className={classes.card}>
              <CardContent className="text-selectable">
                <Typography
                  variant="body1"
                  lang={output.outputLang}
                  className={classNames('text-selectable', classes.outputText)}
                >
                  {output.outputText}
                </Typography>

                {showTransliteration && output.outputRoman && (
                  <Typography variant="body2" color="textSecondary" className={classNames('text-selectable', classes.pos)}>
                    {output.outputRoman}
                  </Typography>
                )}
              </CardContent>
              <CardActions className={classes.outputActions}>
                {controllers.map(({ Icon, tooltip, onClick }) => (
                  <Tooltip title={tooltip} placement="bottom" key={`outputTool_${tooltip}`}>
                    <IconButton
                      className={classes.controllerIconButton}
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ))}
              </CardActions>
            </Card>

            <RatingCard />

            {output.outputDict && output.source === 'translate.googleapis.com' && <Dictionary />}
          </div>
        );
      }
    }
  }

  render() {
    const {
      classes,
      fullscreenInputBox,
      inputLang,
      inputText,
      onChangeRoute,
      onEndTextToSpeech,
      onLoadImage,
      onStartTextToSpeech,
      onSwapLanguages,
      onToggleFullscreenInputBox,
      onTranslate,
      onUpdateInputText,
      onUpdateLanguageListMode,
      output,
      outputLang,
      textToSpeechPlaying,
      translateWhenPressingEnter,
    } = this.props;

    const controllers = [
      {
        Icon: ContentClear,
        tooltip: getLocale('clear'),
        onClick: () => onUpdateInputText(''),
        disabled: inputText.length < 1,
      },
      {
        Icon: (() => (
          <SvgIcon fontSize="small">
            <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z" />
          </SvgIcon>
        )),
        tooltip: getLocale('translateClipboard'),
        onClick: () => {
          const text = window.remote.clipboard.readText();
          onUpdateInputText(text);
          onTranslate(inputLang, outputLang, text);
        },
      },
    ];

    if (isTTSSupported(inputLang)) {
      controllers.push({
        Icon: textToSpeechPlaying ? AVStop : AVVolumeUp,
        tooltip: textToSpeechPlaying ? getLocale('stop') : getLocale('listen'),
        onClick: () => {
          if (textToSpeechPlaying) {
            window.speechSynthesis.cancel();
            return onEndTextToSpeech();
          }

          return onStartTextToSpeech(inputLang, inputText);
        },
      });
    } else if (output && output.inputLang
      && isTTSSupported(output.inputLang) && inputText === output.inputText) {
      controllers.push({
        Icon: textToSpeechPlaying ? AVStop : AVVolumeUp,
        tooltip: textToSpeechPlaying ? getLocale('stop') : getLocale('listen'),
        onClick: () => {
          if (textToSpeechPlaying) {
            window.speechSynthesis.cancel();
            return onEndTextToSpeech();
          }

          return onStartTextToSpeech(output.inputLang, output.inputText);
        },
      });
    }

    if (isOcrSupported(inputLang)) {
      controllers.push({
        Icon: ImageImage,
        tooltip: getLocale('openImageFile'),
        onClick: () => onLoadImage(),
      });
      controllers.push({
        Icon: () => (
          <SvgIcon fontSize="small">
            <path d="M9,6H5V10H7V8H9M19,10H17V12H15V14H19M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2" />
          </SvgIcon>
        ),
        tooltip: getLocale('takeScreenshot'),
        onClick: () => onLoadImage('screenshot'),
      });
    }

    controllers.push({
      Icon: fullscreenInputBox ? NavigationFullscreenExit : NavigationFullscreen,
      tooltip: fullscreenInputBox ? getLocale('exitFullscreen') : getLocale('fullscreen'),
      onClick: onToggleFullscreenInputBox,
    });

    return (
      <div className={classes.container}>
        <div
          className={classes.anotherContainer}
          role="presentation"
        >
          <AppBar position="static" color="default" elevation={0} classes={{ colorDefault: classes.appBarColorDefault }}>
            <Toolbar variant="dense" className={classes.toolbar}>
              <Button
                color="inherit"
                classes={{ root: classes.languageTitle, label: classes.languageTitleLabel }}
                onClick={() => {
                  onUpdateLanguageListMode('inputLang');
                  onChangeRoute(ROUTE_LANGUAGE_LIST);
                }}
              >
                {inputLang === 'auto' && output && output.inputLang ? `${getLocale(output.inputLang)} (${getLocale('auto')})` : getLocale(inputLang)}
              </Button>
              <Tooltip title={getLocale('swap')} placement="bottom">
                <div>
                  <IconButton
                    color="inherit"
                    className={classes.toolbarIconButton}
                    disabled={(() => {
                      if (inputLang !== 'auto') {
                        return false;
                      }
                      if (inputLang === 'auto' && output && output.inputLang) {
                        return false;
                      }
                      return true;
                    })()}
                    onClick={onSwapLanguages}
                  >
                    <ActionSwapHoriz fontSize="small" />
                  </IconButton>
                </div>
              </Tooltip>
              <Button
                color="inherit"
                classes={{ root: classes.languageTitle, label: classes.languageTitleLabel }}
                onClick={() => {
                  onUpdateLanguageListMode('outputLang');
                  onChangeRoute(ROUTE_LANGUAGE_LIST);
                }}
              >
                {getLocale(outputLang)}
              </Button>
            </Toolbar>
          </AppBar>
          <Paper
            elevation={1}
            square
            className={classNames(
              classes.inputContainer,
              { [classes.inputContainerFullScreen]: fullscreenInputBox },
            )}
          >
            <textarea
              ref={this.inputRef}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className={classNames('text-selectable', classes.textarea)}
              lang={inputLang}
              maxLength="10000" // api limit is 11000 chars
              onChange={(e) => onUpdateInputText(
                e.target.value,
                e.target.selectionStart,
                e.target.selectionEnd,
              )}
              onClick={(e) => onUpdateInputText(
                e.target.value,
                e.target.selectionStart,
                e.target.selectionEnd,
              )}
              onInput={(e) => onUpdateInputText(
                e.target.value,
                e.target.selectionStart,
                e.target.selectionEnd,
              )}
              onKeyDown={translateWhenPressingEnter ? (e) => {
                if (e.key === 'Enter') {
                  onTranslate();
                  e.target.blur();
                }

                onUpdateInputText(
                  e.target.value,
                  e.target.selectionStart,
                  e.target.selectionEnd,
                );
              } : null}
              onKeyUp={(e) => onUpdateInputText(
                e.target.value,
                e.target.selectionStart,
                e.target.selectionEnd,
              )}
              placeholder={getLocale('typeSomethingHere')}
              spellCheck="false"
              value={inputText}
            />
            <div className={classes.controllerContainer}>
              <div className={classes.controllerContainerLeft}>
                {controllers.map(({
                  Icon, tooltip, onClick, disabled,
                }) => (disabled ? (
                  <IconButton
                    key={`inputTool_${tooltip}`}
                    className={classes.controllerIconButton}
                    aria-label={tooltip}
                    onClick={onClick}
                    disabled
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ) : (
                  <Tooltip title={tooltip} placement={fullscreenInputBox ? 'top' : 'bottom'} key={`inputTool_${tooltip}`}>
                    <IconButton
                      className={classes.controllerIconButton}
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )))}
              </div>
              <div className={classes.controllerContainerRight}>
                {(inputText.length < 1 || (output && output.status === 'loading')) ? (
                  <Button
                    variant="outlined"
                    size="small"
                    color="default"
                    classes={{ label: classes.translateButtonLabel }}
                    disabled
                  >
                    {getLocale('translate')}
                  </Button>
                ) : (
                  <Tooltip title={window.process.platform === 'darwin' ? '⌘ + T' : 'Ctrl + T'} placement={fullscreenInputBox ? 'top' : 'bottom'}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="default"
                      onClick={() => onTranslate()}
                      classes={{ label: classes.translateButtonLabel }}
                    >
                      {getLocale('translate')}
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          </Paper>
          {this.renderOutput()}
        </div>
      </div>
    );
  }
}

Home.defaultProps = {
  output: null,
};

Home.propTypes = {
  classes: PropTypes.object.isRequired,
  fullscreenInputBox: PropTypes.bool.isRequired,
  inputLang: PropTypes.string.isRequired,
  inputText: PropTypes.string.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  onEndTextToSpeech: PropTypes.func.isRequired,
  onLoadImage: PropTypes.func.isRequired,
  onOpenSnackbar: PropTypes.func.isRequired,
  onStartTextToSpeech: PropTypes.func.isRequired,
  onSwapLanguages: PropTypes.func.isRequired,
  onToggleFullscreenInputBox: PropTypes.func.isRequired,
  onTogglePhrasebook: PropTypes.func.isRequired,
  onTranslate: PropTypes.func.isRequired,
  onUpdateInputLang: PropTypes.func.isRequired,
  onUpdateInputText: PropTypes.func.isRequired,
  onUpdateLanguageListMode: PropTypes.func.isRequired,
  onUpdateOutputLang: PropTypes.func.isRequired,
  output: PropTypes.object,
  outputLang: PropTypes.string.isRequired,
  showTransliteration: PropTypes.bool.isRequired,
  textToSpeechPlaying: PropTypes.bool.isRequired,
  translateWhenPressingEnter: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  fullscreenInputBox: state.pages.home.fullscreenInputBox,
  inputLang: state.preferences.inputLang,
  inputText: state.pages.home.inputText,
  output: state.pages.home.output,
  outputLang: state.preferences.outputLang,
  showTransliteration: state.preferences.showTransliteration,
  textToSpeechPlaying: state.pages.home.textToSpeech.textToSpeechPlaying,
  translateWhenPressingEnter: state.preferences.translateWhenPressingEnter,
});

const actionCreators = {
  changeRoute,
  endTextToSpeech,
  loadImage,
  openSnackbar,
  startTextToSpeech,
  swapLanguages,
  toggleFullscreenInputBox,
  togglePhrasebook,
  translate,
  updateInputLang,
  updateInputText,
  updateLanguageListMode,
  updateOutputLang,
};

export default connectComponent(
  Home,
  mapStateToProps,
  actionCreators,
  styles,
);
