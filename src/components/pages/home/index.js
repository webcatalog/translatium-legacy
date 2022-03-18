/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { clipboard, ShareMenu, getCurrentWindow } from '@electron/remote';

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

import { ROUTE_LANGUAGE_LIST, ROUTE_HOME } from '../../../constants/routes';

import Dictionary from './dictionary';
import History from './history';
import RatingCard from './rating-card';

const useStyles = makeStyles((theme) => ({
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
    paddingTop: 2,
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
  translateButton: {
    marginLeft: theme.spacing(0.5),
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
}));

const textSizeToVariant = (textSize) => {
  switch (textSize) {
    case 7: return 'h1';
    case 6: return 'h2';
    case 5: return 'h3';
    case 4: return 'h4';
    case 3: return 'h5';
    case 2: return 'h6';
    default: return 'body1';
  }
};

const Home = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const fullscreenInputBox = useSelector((state) => state.pages.home.fullscreenInputBox);
  const inputLang = useSelector((state) => state.preferences.inputLang);
  const inputText = useSelector((state) => state.pages.home.inputText);
  const isHomeVisible = useSelector((state) => state.router.route === ROUTE_HOME);
  const output = useSelector((state) => state.pages.home.output);
  const outputLang = useSelector((state) => state.preferences.outputLang);
  const showTransliteration = useSelector((state) => state.preferences.showTransliteration);
  const textSize = useSelector((state) => state.preferences.textSize);
  const textToSpeechPlaying = useSelector(
    (state) => state.pages.home.textToSpeech.textToSpeechPlaying,
  );
  const translateWhenPressingEnter = useSelector(
    (state) => state.preferences.translateWhenPressingEnter,
  );

  const onCompositionRef = useRef(false);
  const inputRef = useRef(null);

  const outputNode = useMemo(() => {
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
            onClick: () => dispatch(togglePhrasebook()),
          },
          {
            Icon: ActionSwapVert,
            tooltip: getLocale('swap'),
            onClick: () => {
              dispatch(updateInputLang(output.outputLang));
              dispatch(updateOutputLang(output.inputLang));
              dispatch(updateInputText(output.outputText));
              dispatch(translate(output.outputLang, output.inputLang, output.outputText));
            },
          },
          {
            Icon: FileCopy,
            tooltip: getLocale('copy'),
            onClick: () => {
              clipboard.writeText(output.outputText);
              dispatch(openSnackbar(getLocale('copied')));
            },
          },
        ];

        if (window.process.platform === 'darwin') {
          controllers.push({
            // eslint-disable-next-line react/prop-types
            Icon: ({ fontSize }) => (
              <SvgIcon fontSize={fontSize}>
                <path fill="currentColor" d="M12,1L8,5H11V14H13V5H16M18,23H6C4.89,23 4,22.1 4,21V9A2,2 0 0,1 6,7H9V9H6V21H18V9H15V7H18A2,2 0 0,1 20,9V21A2,2 0 0,1 18,23Z" />
              </SvgIcon>
            ),
            tooltip: getLocale('share'),
            onClick: () => {
              const shareMenu = new ShareMenu({
                texts: [output.outputText],
              });
              shareMenu.popup(getCurrentWindow());
            },
          });
        }

        if (isTTSSupported(output.outputLang)) {
          controllers.unshift({
            Icon: textToSpeechPlaying ? AVStop : AVVolumeUp,
            tooltip: textToSpeechPlaying ? getLocale('stop') : getLocale('listen'),
            onClick: () => {
              if (textToSpeechPlaying) {
                return dispatch(endTextToSpeech());
              }

              return dispatch(startTextToSpeech(
                output.outputLang,
                output.outputText,
              ));
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
                  variant={textSizeToVariant(textSize)}
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
  }, [
    classes,
    fullscreenInputBox,
    output,
    showTransliteration,
    textSize,
    textToSpeechPlaying,
    dispatch,
  ]);

  useEffect(() => {
    const handleOpenFind = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    };

    window.ipcRenderer.on('open-find', handleOpenFind);

    return () => {
      window.ipcRenderer.removeListener('open-find', handleOpenFind);
    };
  }, [
    inputRef,
  ]);

  useEffect(() => {
    if (isHomeVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isHomeVisible, inputRef]);

  const controllers = [
    {
      Icon: ContentClear,
      tooltip: getLocale('clear'),
      onClick: () => dispatch(updateInputText('')),
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
        const text = clipboard.readText();
        dispatch(updateInputText(text));
        dispatch(translate(inputLang, outputLang, text));
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
          return dispatch(endTextToSpeech());
        }

        return dispatch(startTextToSpeech(inputLang, inputText));
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
          return dispatch(endTextToSpeech());
        }

        return dispatch(startTextToSpeech(output.inputLang, output.inputText));
      },
    });
  }

  if (isOcrSupported(inputLang)) {
    controllers.push({
      Icon: ImageImage,
      tooltip: getLocale('openImageFile'),
      onClick: () => dispatch(loadImage()),
    });
    controllers.push({
      Icon: () => (
        <SvgIcon fontSize="small">
          <path d="M9,6H5V10H7V8H9M19,10H17V12H15V14H19M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2" />
        </SvgIcon>
      ),
      tooltip: getLocale('takeScreenshot'),
      onClick: () => dispatch(loadImage('screenshot')),
    });
  }

  controllers.push({
    Icon: fullscreenInputBox ? NavigationFullscreenExit : NavigationFullscreen,
    tooltip: fullscreenInputBox ? getLocale('exitFullscreen') : getLocale('fullscreen'),
    onClick: () => dispatch(toggleFullscreenInputBox()),
  });

  const secondaryControllers = [
    {
      Icon: FileCopy,
      tooltip: getLocale('copy'),
      onClick: () => {
        clipboard.writeText(inputText);
        dispatch(openSnackbar(getLocale('copied')));
      },
      disabled: inputText.length < 1,
    },
  ];

  if (window.process.platform === 'darwin') {
    secondaryControllers.push({
      // eslint-disable-next-line react/prop-types
      Icon: ({ fontSize }) => (
        <SvgIcon fontSize={fontSize}>
          <path fill="currentColor" d="M12,1L8,5H11V14H13V5H16M18,23H6C4.89,23 4,22.1 4,21V9A2,2 0 0,1 6,7H9V9H6V21H18V9H15V7H18A2,2 0 0,1 20,9V21A2,2 0 0,1 18,23Z" />
        </SvgIcon>
      ),
      tooltip: getLocale('share'),
      onClick: () => {
        const shareMenu = new ShareMenu({
          texts: [inputText],
        });
        shareMenu.popup(getCurrentWindow());
      },
      disabled: inputText.length < 1,
    });
  }

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
                dispatch(updateLanguageListMode('inputLang'));
                dispatch(changeRoute(ROUTE_LANGUAGE_LIST));
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
                  onClick={() => dispatch(swapLanguages())}
                >
                  <ActionSwapHoriz fontSize="small" />
                </IconButton>
              </div>
            </Tooltip>
            <Button
              color="inherit"
              classes={{ root: classes.languageTitle, label: classes.languageTitleLabel }}
              onClick={() => {
                dispatch(updateLanguageListMode('outputLang'));
                dispatch(changeRoute(ROUTE_LANGUAGE_LIST));
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
            ref={inputRef}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={classNames('text-selectable', classes.textarea)}
            lang={inputLang}
            maxLength="10000" // api limit is 11000 chars
            onChange={(e) => dispatch(updateInputText(e.target.value))}
            // handle Chinese, Japanese, Korean IME
            // https://github.com/facebook/react/issues/3926#issuecomment-929799564
            // https://stackoverflow.com/a/51221639
            onCompositionStart={() => {
              onCompositionRef.current = true;
            }}
            onCompositionEnd={() => {
              onCompositionRef.current = false;
            }}
            onKeyDown={translateWhenPressingEnter ? (e) => {
              if (e.key === 'Enter' && !onCompositionRef.current) {
                dispatch(translate());
                e.target.blur();
              }
            } : null}
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
              {secondaryControllers.map(({
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
              {(inputText.length < 1 || (output && output.status === 'loading')) ? (
                <Button
                  variant="outlined"
                  size="small"
                  color="default"
                  classes={{
                    root: classes.translateButton,
                    label: classes.translateButtonLabel,
                  }}
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
                    onClick={() => dispatch(translate())}
                    classes={{
                      root: classes.translateButton,
                      label: classes.translateButtonLabel,
                    }}
                  >
                    {getLocale('translate')}
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </Paper>
        {outputNode}
      </div>
    </div>
  );
};

export default Home;
