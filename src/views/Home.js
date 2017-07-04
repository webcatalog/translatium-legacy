/* global Windows */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import shortid from 'shortid';

import { fullWhite } from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Card, { CardActions, CardHeader, CardContent } from 'material-ui/Card';
import { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';

import ActionSwapHoriz from 'material-ui-icons/SwapHoriz';
import NavigationArrowDropDown from 'material-ui-icons/ArrowDropDown';
import ContentClear from 'material-ui-icons/Clear';
import NavigationMoreVert from 'material-ui-icons/MoreVert';
import ImageCameraAlt from 'material-ui-icons/CameraAlt';
import ImageImage from 'material-ui-icons/Image';
import ContentGesture from 'material-ui-icons/Gesture';
import AVVolumeUp from 'material-ui-icons/VolumeUp';
import AVStop from 'material-ui-icons/Stop';
import AVMic from 'material-ui-icons/Mic';
import ContentCopy from 'material-ui-icons/ContentCopy';
import SocialShare from 'material-ui-icons/Share';
import EditorFormatSize from 'material-ui-icons/FormatSize';
import ActionSwapVert from 'material-ui-icons/SwapVert';
import ToggleStarBorder from 'material-ui-icons/StarBorder';
import ToggleStar from 'material-ui-icons/Star';
import NavigationFullscreen from 'material-ui-icons/Fullscreen';
import NavigationFullscreenExit from 'material-ui-icons/FullscreenExit';
import ActionLightbulbOutline from 'material-ui-icons/LightbulbOutline';

import EnhancedMenu from './EnhancedMenu';

import {
  isOutput,
  isTtsSupported,
  isVoiceRecognitionSupported,
  isHandwritingSupported,
  isOcrSupported,
  toCountryRemovedLanguage,
} from '../libs/languageUtils';

import { swapLanguages, updateInputLang, updateOutputLang } from '../actions/settings';
import {
  updateInputText,
  translate,
  updateImeMode,
  togglePhrasebook,
  toggleFullscreenInputBox,
} from '../actions/home';
import { loadImage } from '../actions/ocr';
import { playTextToSpeech, stopTextToSpeech } from '../actions/textToSpeech';
import { openSnackbar } from '../actions/snackbar';

import getPlatform from '../libs/getPlatform';
import copyToClipboard from '../libs/copyToClipboard';
import shareText from '../libs/shareText';
import askIfEnjoy from '../libs/askIfEnjoy';

import Dictionary from './Dictionary';
import Handwriting from './Handwriting';
import Speech from './Speech';
import History from './History';

class Home extends React.Component {
  componentDidMount() {
    if (getPlatform() === 'windows') {
      const { preventScreenLock } = this.props;
      if (preventScreenLock === true) {
        this.dispRequest = new Windows.System.Display.DisplayRequest();
        this.dispRequest.requestActive();
      }
    }

    const { launchCount } = this.props;
    if (launchCount === 5) {
      askIfEnjoy();
    }
  }
  componentWillUnmount() {
    if (getPlatform() === 'windows') {
      if (this.dispRequest) {
        this.dispRequest.requestRelease();
      }
    }
  }

  renderOutput() {
    const {
      output,
      screenWidth,
      fullscreenInputBox,
      chinaMode,
      textToSpeechPlaying,
      strings,
      onListenButtonClick,
      onTogglePhrasebookClick,
      onSwapOutputButtonClick,
      onBiggerTextButtonClick,
      onSuggestedInputLangClick,
      onSuggestedInputTextClick,
      onRequestCopyToClipboard,
    } = this.props;

    if (fullscreenInputBox === true) {
      return null;
    }

    if (!output) return <History />;

    switch (output.status) {
      case 'loading': {
        return (
          <div>
            <CircularProgress size={80} thickness={5} />
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
            icon: <ContentCopy />,
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
                textToSpeechPlaying, output.outputLang, output.outputText, chinaMode,
              ),
          });
        }

        if (getPlatform() !== 'mac') {
          controllers.push({
            icon: <SocialShare />,
            tooltip: strings.share,
            onClick: () => shareText(output.outputText),
          });
        }

        const maxVisibleIcon = Math.min(Math.round((screenWidth - 120) / 56), controllers.length);
        const showMoreButton = (maxVisibleIcon < controllers.length);

        const hasDict = output.inputDict !== undefined && output.outputDict !== undefined;

        return (
          <div>
            {output.inputRoman ? (
              <p className="text-selectable">{output.inputRoman}</p>
            ) : null}

            {output.suggestedInputLang ? (
              <p>
                <ActionLightbulbOutline />
                <span>
                  <span>{strings.translateFrom}: </span>
                  <a
                    role="button"
                    tabIndex={0}
                    onClick={() => onSuggestedInputLangClick(output.suggestedInputLang)}
                  >
                    {strings[output.suggestedInputLang]}
                  </a> ?
                </span>
              </p>
            ) : null}

            {output.suggestedInputText ? (
              <p>
                <ActionLightbulbOutline />
                <span>
                  <span>{strings.didYouMean}: </span>
                  <a
                    role="button"
                    tabIndex={0}
                    onClick={() => onSuggestedInputTextClick(output.suggestedInputText)}
                  >
                    {output.suggestedInputText}
                  </a> ?
                </span>
              </p>
            ) : null}

            <Card initiallyExpanded>
              <CardHeader
                title={strings[output.outputLang]}
                subtitle={strings.fromLanguage.replace('{1}', strings[output.inputLang])}
                actAsExpander={hasDict}
                showExpandableButton={hasDict}
              />
              <CardContent
                className="text-selectable"
                lang={toCountryRemovedLanguage(output.outputLang)}
              >
                {output.outputText}
              </CardContent>
              {output.outputRoman ? (
                <CardContent className="text-selectable">
                  {output.outputRoman}
                </CardContent>
              ) : null}
              <CardActions>
                {
                  controllers.slice(0, maxVisibleIcon)
                  .map(({ icon, tooltip, onClick }) => (
                    <IconButton
                      tooltip={tooltip}
                      tooltipPosition="bottom-center"
                      key={shortid.generate()}
                      onClick={onClick}
                    >
                      {icon}
                    </IconButton>
                  ))
                }
                {(showMoreButton) ? (
                  <EnhancedMenu
                    id="homeMore2"
                    buttonElement={(
                      <IconButton tooltip={strings.more} tooltipPosition="bottom-center">
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
                          <MenuItem
                            leftIcon={icon}
                            key={shortid.generate()}
                            onClick={onClick}
                          >
                            {tooltip}
                          </MenuItem>
                        ))
                    }
                  </EnhancedMenu>
                ) : null}
              </CardActions>
              {hasDict ? (
                <CardContent expandable>
                  <Dictionary output={output} />
                </CardContent>
              ) : null}
            </Card>
            <p>{strings.translatedByGoogle}</p>
          </div>
        );
      }
    }
  }

  render() {
    const {
      screenWidth,
      translateWhenPressingEnter,
      inputLang, outputLang,
      inputText,
      imeMode,
      textToSpeechPlaying,
      fullscreenInputBox,
      strings,
      onLanguageClick,
      onSwapButtonClick,
      onKeyDown, onInputText,
      onClearButtonClick,
      onListenButtonClick,
      onWriteButtonClick,
      onSpeakButtonClick,
      onTranslateButtonClick,
      onOpenImageButtonClick,
      onCameraButtonClick,
      onFullscreenButtonClick,
      onAnotherContainerClick,
    } = this.props;

    const controllers = [
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

    if (isHandwritingSupported(inputLang)) {
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

    if (getPlatform() === 'windows') {
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

    const tooltipPos = fullscreenInputBox ? 'top-center' : 'bottom-center';

    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onAnotherContainerClick(imeMode)}
        >
          <AppBar position="static">
            <Toolbar>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onLanguageClick('inputLang')}
              >
                <span>{strings[inputLang]}</span>
                <div>
                  <NavigationArrowDropDown color={fullWhite} />
                </div>
              </div>
              <div>
                <IconButton disabled={!isOutput(inputLang)} onClick={onSwapButtonClick}>
                  <ActionSwapHoriz color={fullWhite} />
                </IconButton>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onLanguageClick('outputLang')}
              >
                <span>{strings[outputLang]}</span>
                <div>
                  <NavigationArrowDropDown color={fullWhite} />
                </div>
              </div>
            </Toolbar>
          </AppBar>
          <Paper zDepth={2}>
            <textarea
              className="text-selectable"
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
            <div>
              <div>
                {
                  controllers.slice(0, maxVisibleIcon)
                  .map(({ icon, tooltip, onClick }) => (
                    <IconButton
                      tooltip={tooltip}
                      tooltipPosition={tooltipPos}
                      key={shortid.generate()}
                      onClick={onClick}
                    >
                      {icon}
                    </IconButton>
                  ))
                }
                {(showMoreButton) ? (
                  <EnhancedMenu
                    id="homeMore"
                    buttonElement={(
                      <IconButton tooltip={strings.more} tooltipPosition={tooltipPos}>
                        <NavigationMoreVert />
                      </IconButton>
                    )}
                  >
                    {
                      controllers
                        .slice(maxVisibleIcon, controllers.length)
                        .map(({ icon, tooltip, onClick }) => (
                          <MenuItem
                            leftIcon={icon}
                            key={shortid.generate()}
                            onClick={onClick}
                          >
                            {tooltip}
                          </MenuItem>
                        ))
                    }
                  </EnhancedMenu>
                ) : null}
              </div>
              <div>
                <Button raised color="primary" onClick={onTranslateButtonClick}>
                  {strings.translate}
                </Button>
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
  screenWidth: PropTypes.number,
  translateWhenPressingEnter: PropTypes.bool,
  preventScreenLock: PropTypes.bool,
  inputLang: PropTypes.string,
  outputLang: PropTypes.string,
  inputText: PropTypes.string,
  // eslint-disable-next-line
  output: PropTypes.object,
  imeMode: PropTypes.string,
  textToSpeechPlaying: PropTypes.bool,
  fullscreenInputBox: PropTypes.bool,
  launchCount: PropTypes.number,
  chinaMode: PropTypes.bool,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onLanguageClick: PropTypes.func.isRequired,
  onSwapButtonClick: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onInputText: PropTypes.func.isRequired,
  onClearButtonClick: PropTypes.func.isRequired,
  onListenButtonClick: PropTypes.func.isRequired,
  onTranslateButtonClick: PropTypes.func.isRequired,
  onWriteButtonClick: PropTypes.func.isRequired,
  onSpeakButtonClick: PropTypes.func.isRequired,
  onTogglePhrasebookClick: PropTypes.func.isRequired,
  onOpenImageButtonClick: PropTypes.func.isRequired,
  onCameraButtonClick: PropTypes.func.isRequired,
  onSwapOutputButtonClick: PropTypes.func.isRequired,
  onBiggerTextButtonClick: PropTypes.func.isRequired,
  onFullscreenButtonClick: PropTypes.func.isRequired,
  onSuggestedInputLangClick: PropTypes.func.isRequired,
  onSuggestedInputTextClick: PropTypes.func.isRequired,
  onAnotherContainerClick: PropTypes.func.isRequired,
  onRequestCopyToClipboard: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  screenWidth: state.screen.screenWidth,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
  preventScreenLock: state.settings.preventingScreenLock,
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  inputText: state.home.inputText,
  output: state.home.output,
  imeMode: state.home.imeMode,
  textToSpeechPlaying: state.textToSpeech.textToSpeechPlaying,
  fullscreenInputBox: state.home.fullscreenInputBox,
  launchCount: state.settings.launchCount,
  chinaMode: state.settings.chinaMode,
  strings: state.strings,
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
  onClearButtonClick: () => dispatch(updateInputText('')),
  onListenButtonClick: (toStop, lang, text, chinaMode) => {
    if (toStop) {
      dispatch(stopTextToSpeech());
      return;
    }
    dispatch(playTextToSpeech(lang, text, chinaMode));
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

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Home);
