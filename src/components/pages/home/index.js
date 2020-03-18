import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CircularProgress from '@material-ui/core/CircularProgress';
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
  isTtsSupported,
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
  insertInputText,
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

import YandexDictionary from './yandex-dictionary';
import History from './history';

const { remote } = window.require('electron');

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
    border: 0,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    outline: 0,
    margin: 0,
    padding: 12,
    fontSize: '1rem',
    boxSizing: 'border-box',
    flex: 1,
    resize: 'none',
  },
  controllerContainer: {
    flexBasis: 48,
    paddingLeft: 8,
    paddingRight: 8,
    boxSizing: 'border-box',
    borderTop: `1px solid ${theme.palette.text.disabled}`,
  },
  controllerContainerLeft: {
    paddingTop: 2,
    float: 'left',
  },
  controllerContainerRight: {
    float: 'right',
    paddingTop: 6,
  },
  resultContainer: {
    flex: 1,
    paddingBottom: 12,
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
  yandexCopyright: {
    color: theme.palette.text.disabled,
    cursor: 'pointer',
    fontWeight: 400,
    fontSize: '0.8rem',
    marginLeft: 12,
    marginRight: 12,
  },
  outputText: {
    fontSize: '1rem',
  },
  appBarColorDefault: {
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
  },
  translateButtonLabel: {
    fontWeight: 500,
  },
  outputActions: {
    padding: '0 4px 2px 4px',
  },
  inputRoman: {
    padding: '0 12px',
    marginBottom: 12,
  },
});

class Home extends React.Component {
  renderOutput() {
    const {
      classes,
      fullscreenInputBox,
      onEndTextToSpeech,
      onOpenSnackbar,
      onStartTextToSpeech,
      onTogglePhrasebook,
      onUpdateInputLang,
      onUpdateInputText,
      onUpdateOutputLang,
      output,
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
              onUpdateInputLang(output.inputLang);
              onUpdateOutputLang(output.outputLang);
              onUpdateInputText(output.inputText);
            },
          },
          {
            Icon: FileCopy,
            tooltip: getLocale('copy'),
            onClick: () => {
              remote.clipboard.writeText(output.outputText);
              onOpenSnackbar(getLocale('copied'));
            },
          },
        ];

        if (isTtsSupported(output.outputLang)) {
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
            {output.inputRoman && (
              <Typography
                variant="body2"
                color="textSecondary"
                className={classNames('text-selectable', classes.inputRoman)}
              >
                {output.inputRoman}
              </Typography>
            )}
            <Card>
              <CardContent className="text-selectable">
                <Typography
                  variant="body2"
                  lang={output.outputLang}
                  className={classNames('text-selectable', classes.outputText)}
                >
                  {output.outputText}
                </Typography>

                {output.outputRoman && (
                  <Typography variant="body2" color="textSecondary" className={classNames('text-selectable', classes.pos)}>
                    {output.outputRoman}
                  </Typography>
                )}
              </CardContent>
              <CardActions className={classes.outputActions}>
                {controllers.map(({ Icon, tooltip, onClick }) => (
                  <Tooltip title={tooltip} placement="bottom" key={`outputTool_${tooltip}`}>
                    <IconButton
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ))}
              </CardActions>
            </Card>
            <Typography
              variant="body2"
              align="left"
              className={classes.yandexCopyright}
              onClick={() => remote.shell.openExternal('http://translate.yandex.com/')}
            >
              Powered by Yandex.Translate
            </Typography>

            {output.outputDict && <YandexDictionary />}
            {output.outputDict && output.outputDict.def.length > 0 && (
              <Typography
                variant="body2"
                align="left"
                className={classes.yandexCopyright}
                onClick={() => remote.shell.openExternal('https://tech.yandex.com/dictionary/')}
              >
                Powered by Yandex.Dictionary
              </Typography>
            )}
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
      onInsertInputText,
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
      },
      {
        Icon: (() => (
          <SvgIcon fontSize="small">
            <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z" />
          </SvgIcon>
        )),
        tooltip: getLocale('pasteFromClipboard'),
        onClick: () => {
          const text = remote.clipboard.readText();
          onInsertInputText(text);
        },
      },
    ];

    if (isTtsSupported(inputLang)) {
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
      && isTtsSupported(output.inputLang) && inputText === output.inputText) {
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
        onClick: () => onLoadImage(false),
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
          <AppBar position="static" color="default" classes={{ colorDefault: classes.appBarColorDefault }}>
            <Toolbar variant="dense">
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
                    disabled={inputLang === 'auto'}
                    onClick={onSwapLanguages}
                  >
                    <ActionSwapHoriz />
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
            elevation={2}
            className={classNames(
              classes.inputContainer,
              { [classes.inputContainerFullScreen]: fullscreenInputBox },
            )}
          >
            <textarea
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className={classNames('mousetrap', 'text-selectable', classes.textarea)}
              lang={inputLang}
              maxLength="1000"
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
                  onTranslate(true);
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
                {controllers.map(({ Icon, tooltip, onClick }) => (
                  <Tooltip title={tooltip} placement={fullscreenInputBox ? 'top' : 'bottom'} key={`inputTool_${tooltip}`}>
                    <IconButton
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ))}
              </div>
              <div className={classes.controllerContainerRight}>
                <Tooltip title={getLocale('andSaveToHistory')} placement={fullscreenInputBox ? 'top' : 'bottom'}>
                  <Button
                    variant="outlined"
                    size="medium"
                    color="default"
                    onClick={() => onTranslate(true)}
                    classes={{ label: classes.translateButtonLabel }}
                  >
                    {getLocale('translate')}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Paper>
          {this.renderOutput()}
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
  fullscreenInputBox: PropTypes.bool,
  inputLang: PropTypes.string,
  inputText: PropTypes.string,
  onChangeRoute: PropTypes.func.isRequired,
  onEndTextToSpeech: PropTypes.func.isRequired,
  onInsertInputText: PropTypes.func.isRequired,
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
  outputLang: PropTypes.string,
  textToSpeechPlaying: PropTypes.bool.isRequired,
  translateWhenPressingEnter: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  fullscreenInputBox: state.pages.home.fullscreenInputBox,
  inputLang: state.preferences.inputLang,
  inputText: state.pages.home.inputText,
  output: state.pages.home.output,
  outputLang: state.preferences.outputLang,
  textToSpeechPlaying: state.pages.home.textToSpeech.textToSpeechPlaying,
  translateWhenPressingEnter: state.preferences.translateWhenPressingEnter,
});

const actionCreators = {
  changeRoute,
  endTextToSpeech,
  insertInputText,
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
