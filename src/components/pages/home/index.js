import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import classNames from 'classnames';

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

import AVStop from '@material-ui/icons/Stop';
import AVVolumeUp from '@material-ui/icons/VolumeUp';
import ActionSwapHoriz from '@material-ui/icons/SwapHoriz';
import ActionSwapVert from '@material-ui/icons/SwapVert';
import ContentClear from '@material-ui/icons/Clear';
import ImageImage from '@material-ui/icons/Image';
import NavigationFullscreen from '@material-ui/icons/Fullscreen';
import NavigationFullscreenExit from '@material-ui/icons/FullscreenExit';
import NavigationMoreVert from '@material-ui/icons/MoreVert';
import ToggleStar from '@material-ui/icons/Star';
import ToggleStarBorder from '@material-ui/icons/StarBorder';
import Tooltip from '@material-ui/core/Tooltip';
import FileCopy from '@material-ui/icons/FileCopy';

import connectComponent from '../../../helpers/connect-component';

import EnhancedMenu from '../enhanced-menu';

import {
  isOcrSupported,
  isTtsSupported,
} from '../../../helpers/language-utils';

import { loadImage } from '../../../state/pages/ocr/actions';
import { openSnackbar } from '../../../state/root/snackbar/actions';
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

import Dictionary from './dictionary';
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
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: 16,
    textTransform: 'none',
    fontWeight: 500,
  },
  yandexCopyright: {
    color: theme.palette.text.disabled,
    cursor: 'pointer',
    fontWeight: 400,
    fontSize: '0.8rem',
    marginLeft: 12,
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
});

class Home extends React.Component {
  renderOutput() {
    const {
      classes,
      fullscreenInputBox,
      onRequestCopyToClipboard,
      onStartTextToSpeech,
      onEndTextToSpeech,
      onSwapOutputButtonClick,
      onTogglePhrasebookClick,
      output,
      screenWidth,
      textToSpeechPlaying,
      locale,
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
            tooltip: output.phrasebookId ? locale.removeFromPhrasebook : locale.addToPhrasebook,
            onClick: onTogglePhrasebookClick,
          },
          {
            Icon: ActionSwapVert,
            tooltip: locale.swap,
            onClick: () => onSwapOutputButtonClick(
              output.outputLang,
              output.inputLang,
              output.outputText,
            ),
          },
          {
            Icon: FileCopy,
            tooltip: locale.copy,
            onClick: () => onRequestCopyToClipboard(output.outputText, locale.copied),
          },
        ];

        if (isTtsSupported(output.outputLang)) {
          controllers.unshift({
            Icon: textToSpeechPlaying ? AVStop : AVVolumeUp,
            tooltip: textToSpeechPlaying ? locale.stop : locale.listen,
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

        const maxVisibleIcon = Math.min(Math.round((screenWidth - 120) / 56), controllers.length);
        const showMoreButton = (maxVisibleIcon < controllers.length);

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

            <Card>
              <CardContent className="text-selectable">
                <Typography
                  variant="body1"
                  lang={output.outputLang}
                  className={classNames('text-selectable', classes.outputText)}
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
                {controllers.slice(0, maxVisibleIcon).map(({ Icon, tooltip, onClick }) => (
                  <Tooltip title={tooltip} placement="bottom" key={`outputTool_${tooltip}`}>
                    <IconButton
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ))}
                {showMoreButton && (
                  <EnhancedMenu
                    id="homeMore2"
                    buttonElement={(
                      <IconButton aria-label={locale.more} tooltipPosition="bottom-center">
                        <NavigationMoreVert />
                      </IconButton>
                    )}
                    anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                  >
                    {
                      controllers
                        .slice(maxVisibleIcon, controllers.length)
                        .map(({ Icon, tooltip, onClick }) => (
                          <ListItem button onClick={onClick} key={`outputTool_${tooltip}`}>
                            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={tooltip} />
                          </ListItem>
                        ))
                    }
                  </EnhancedMenu>
                )}
              </CardActions>
            </Card>
            <Typography
              variant="body1"
              align="left"
              className={classes.yandexCopyright}
              onClick={() => remote.shell.openExternal('http://translate.yandex.com/')}
            >
              {locale.translatedByYandexTranslate}
            </Typography>

            {output.outputDict && <Dictionary output={output} />}
            {output.outputDict && output.outputDict.def.length > 0 && (
              <Typography
                variant="body1"
                align="left"
                className={classes.yandexCopyright}
                onClick={() => remote.shell.openExternal('https://tech.yandex.com/dictionary/')}
              >
                {locale.translatedByYandexDictionary}
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
      locale,
      onClearButtonClick,
      onEndTextToSpeech,
      onFullscreenButtonClick,
      onInsertText,
      onKeyDown, onInputText,
      onLanguageClick,
      onOpenImageButtonClick,
      onStartTextToSpeech,
      onSwapButtonClick,
      onTranslateButtonClick,
      output,
      outputLang,
      screenWidth,
      textToSpeechPlaying,
      translateWhenPressingEnter,
    } = this.props;

    const controllers = [
      {
        Icon: ContentClear,
        tooltip: locale.clear,
        onClick: onClearButtonClick,
      },
      {
        Icon: (() => (
          <SvgIcon fontSize="small">
            <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z" />
          </SvgIcon>
        )),
        tooltip: locale.pasteFromClipboard,
        onClick: () => {
          const text = remote.clipboard.readText();
          onInsertText(text);
        },
      },
    ];

    if (isTtsSupported(inputLang)) {
      controllers.push({
        Icon: textToSpeechPlaying ? AVStop : AVVolumeUp,
        tooltip: textToSpeechPlaying ? locale.stop : locale.listen,
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
        tooltip: textToSpeechPlaying ? locale.stop : locale.listen,
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
        tooltip: locale.openImageFile,
        onClick: onOpenImageButtonClick,
      });
    }

    controllers.push({
      Icon: fullscreenInputBox ? NavigationFullscreenExit : NavigationFullscreen,
      tooltip: fullscreenInputBox ? locale.exitFullscreen : locale.fullscreen,
      onClick: onFullscreenButtonClick,
    });

    const maxVisibleIcon = Math.min(Math.round((screenWidth - 200) / 56), controllers.length);

    const showMoreButton = (maxVisibleIcon < controllers.length);

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
                className={classes.languageTitle}
                onClick={() => onLanguageClick('inputLang')}
              >
                {inputLang === 'auto' && output && output.inputLang ? `${locale[output.inputLang]} (${locale.auto})` : locale[inputLang]}
              </Button>
              <Tooltip title={locale.swap} placement="bottom">
                <div>
                  <IconButton
                    color="inherit"
                    disabled={inputLang === 'auto'}
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
                {locale[outputLang]}
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
              onChange={onInputText}
              onClick={onInputText}
              onInput={onInputText}
              onKeyDown={translateWhenPressingEnter ? (e) => onKeyDown(e) : null}
              onKeyUp={onInputText}
              placeholder={locale.typeSomethingHere}
              spellCheck="false"
              value={inputText}
            />
            <div className={classes.controllerContainer}>
              <div className={classes.controllerContainerLeft}>
                {controllers.slice(0, maxVisibleIcon).map(({ Icon, tooltip, onClick }) => (
                  <Tooltip title={tooltip} placement={fullscreenInputBox ? 'top' : 'bottom'} key={`inputTool_${tooltip}`}>
                    <IconButton
                      aria-label={tooltip}
                      onClick={onClick}
                    >
                      {<Icon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                ))}
                {showMoreButton && (
                  <EnhancedMenu
                    id="homeMore"
                    buttonElement={(
                      <IconButton aria-label={locale.more}>
                        <NavigationMoreVert />
                      </IconButton>
                    )}
                  >
                    {
                      controllers
                        .slice(maxVisibleIcon, controllers.length)
                        .map(({ Icon, tooltip, onClick }) => (
                          <ListItem button onClick={onClick} key={`inputTool_${tooltip}`}>
                            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={tooltip} />
                          </ListItem>
                        ))
                    }
                  </EnhancedMenu>
                )}
              </div>
              <div className={classes.controllerContainerRight}>
                <Tooltip title={locale.andSaveToHistory} placement={fullscreenInputBox ? 'top' : 'bottom'}>
                  <Button
                    variant="outlined"
                    size="medium"
                    color="default"
                    onClick={onTranslateButtonClick}
                    classes={{ label: classes.translateButtonLabel }}
                  >
                    {locale.translate}
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
  onClearButtonClick: PropTypes.func.isRequired,
  onEndTextToSpeech: PropTypes.func.isRequired,
  onFullscreenButtonClick: PropTypes.func.isRequired,
  onInputText: PropTypes.func.isRequired,
  onInsertText: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onLanguageClick: PropTypes.func.isRequired,
  onOpenImageButtonClick: PropTypes.func.isRequired,
  onRequestCopyToClipboard: PropTypes.func.isRequired,
  onStartTextToSpeech: PropTypes.func.isRequired,
  onSwapButtonClick: PropTypes.func.isRequired,
  onSwapOutputButtonClick: PropTypes.func.isRequired,
  onTogglePhrasebookClick: PropTypes.func.isRequired,
  onTranslateButtonClick: PropTypes.func.isRequired,
  output: PropTypes.object,
  outputLang: PropTypes.string,
  screenWidth: PropTypes.number,
  textToSpeechPlaying: PropTypes.bool.isRequired,
  translateWhenPressingEnter: PropTypes.bool,
  locale: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  fullscreenInputBox: state.pages.home.fullscreenInputBox,
  inputLang: state.preferences.inputLang,
  inputText: state.pages.home.inputText,
  locale: state.locale,
  output: state.pages.home.output,
  outputLang: state.preferences.outputLang,
  screenWidth: state.screen.screenWidth,
  textToSpeechPlaying: state.pages.home.textToSpeech.textToSpeechPlaying,
  translateWhenPressingEnter: state.preferences.translateWhenPressingEnter,
});

const mapDispatchToProps = (dispatch) => ({
  onLanguageClick: (type) => dispatch(push({
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
  onClearButtonClick: () => dispatch(updateInputText('')),
  onInsertText: (text) => dispatch(insertInputText(text)),
  onTranslateButtonClick: () => dispatch(translate(true)),
  onTogglePhrasebookClick: () => dispatch(togglePhrasebook()),
  onOpenImageButtonClick: () => dispatch(loadImage(false)),
  onSwapOutputButtonClick: (inputLang, outputLang, inputText) => {
    dispatch(updateInputLang(inputLang));
    dispatch(updateOutputLang(outputLang));
    dispatch(updateInputText(inputText));
  },
  onFullscreenButtonClick: () => dispatch(toggleFullscreenInputBox()),
  onSuggestedInputLangClick: (value) => dispatch(updateInputLang(value)),
  onSuggestedInputTextClick: (text) => dispatch(updateInputText(text)),
  onRequestCopyToClipboard: (text, localeCopied) => {
    remote.clipboard.writeText(text);
    dispatch(openSnackbar(localeCopied));
  },
  onStartTextToSpeech: (lang, text) => {
    dispatch(startTextToSpeech(lang, text));
  },
  onEndTextToSpeech: () => {
    dispatch(endTextToSpeech());
  },
});

export default connectComponent(
  Home,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
