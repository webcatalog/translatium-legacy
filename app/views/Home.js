/* global strings */
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Immutable from 'immutable';

import { fullWhite, minBlack, grey100, fullBlack, darkWhite } from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ContentClear from 'material-ui/svg-icons/content/clear';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import ImageCameraAlt from 'material-ui/svg-icons/image/camera-alt';
import ContentGesture from 'material-ui/svg-icons/content/gesture';
import AVVolumeUp from 'material-ui/svg-icons/av/volume-up';
import AVStop from 'material-ui/svg-icons/av/stop';
import AVMic from 'material-ui/svg-icons/av/mic';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import SocialShare from 'material-ui/svg-icons/social/share';
import EditorFormatSize from 'material-ui/svg-icons/editor/format-size';
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert';
import ToggleStarBorder from 'material-ui/svg-icons/toggle/star-border';
import ToggleStar from 'material-ui/svg-icons/toggle/star';

import { swapLanguages } from '../actions/settings';
import { updateInputText, translate, updateImeMode } from '../actions/home';
import { playTextToSpeech, stopTextToSpeech } from '../actions/textToSpeech';
import Dictionary from './Dictionary';
import Handwriting from './Handwriting';

class Home extends React.Component {
  getStyles() {
    const { theme } = this.props;

    const {
      appBar,
      button: {
        iconButtonSize,
      },
    } = this.context.muiTheme;

    return {
      container: {
        flex: 1,
        backgroundColor: (theme === 'dark') ? fullBlack : grey100,
        display: 'flex',
        flexDirection: 'column',
      },
      innerContainer: {
        flex: 1,
        display: 'flex',
      },
      languageTitle: {
        flex: 1,
        overflow: 'hidden',
        margin: 0,
        paddingTop: 0,
        letterSpacing: 0,
        fontSize: 16,
        fontWeight: appBar.titleFontWeight,
        color: appBar.textColor,
        height: appBar.height,
        lineHeight: `${appBar.height}px`,
        display: 'flex',
        justifyContent: 'center',
        WebkitUserSelect: 'none',
        cursor: 'pointer',
      },
      languageTitleSpan: {
        float: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      dropDownIconContainer: {
        height: appBar.height,
        paddingTop: (appBar.height - iconButtonSize) / 2,
        float: 'left',
      },
      swapIconContainer: {
        paddingTop: (appBar.height - iconButtonSize) / 2,
      },
      inputContainer: {
        height: 160,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      },
      textarea: {
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        color: (theme === 'dark') ? fullWhite : null,
        backgroundColor: (theme === 'dark') ? '#303030' : fullWhite,
        borderBottom: `1px solid ${(theme === 'dark') ? darkWhite : minBlack}`,
        outline: 0,
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
        padding: '24px 12px',
        boxSizing: 'border-box',
        height: '100%',
        overflowY: 'auto',
      },
      progressContainer: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };
  }

  renderOutput(styles) {
    const { output, screenWidth, textToSpeechPlaying, onListenButtonTouchTap } = this.props;

    if (!output) return null;

    switch (output.get('status')) {
      case 'loading': {
        return (
          <div style={styles.progressContainer} >
            <CircularProgress size={80} thickness={5} />
          </div>
        );
      }
      default: {
        const controllers = [
          {
            icon: textToSpeechPlaying ? <AVStop /> : <AVVolumeUp />,
            tooltip: textToSpeechPlaying ? strings.stop : strings.listen,
            onTouchTap: () => onListenButtonTouchTap(textToSpeechPlaying, output.get('outputLang'), output.get('outputText')),
          },
          {
            icon: <ActionSwapVert />,
            tooltip: strings.swap,
          },
          {
            icon: <EditorFormatSize />,
            tooltip: strings.biggerText,
          },
          {
            icon: <ContentCopy />,
            tooltip: strings.copy,
          },
          {
            icon: <SocialShare />,
            tooltip: strings.share,
          },
          {
            icon: output.has('phrasebookId') ? <ToggleStar /> : <ToggleStarBorder />,
            tooltip: output.has('phrasebookId') ? strings.removeFromPhrasebook : strings.addToPhrasebook,
          },
        ];

        const maxVisibleIcon = Math.min(Math.round((screenWidth - 100) / 56), controllers.length);
        const showMoreButton = (maxVisibleIcon < controllers.length);

        const hasDict = output.get('inputDict') !== undefined && output.get('outputDict') !== undefined;

        return (
          <Card initiallyExpanded>
            <CardHeader
              title={strings[output.get('outputLang')]}
              subtitle={strings.fromLanguage.replace('{1}', strings[output.get('inputLang')])}
              actAsExpander={hasDict}
              showExpandableButton={hasDict}
            />
            <CardText style={{ fontSize: 20 }}>
              {output.get('outputText')}
            </CardText>
            <CardActions>
              {controllers.slice(0, maxVisibleIcon).map(({ icon, tooltip, onTouchTap }, i) => (
                <IconButton
                  tooltip={tooltip}
                  tooltipPosition="bottom-center"
                  key={`dIconButton_${i}`}
                  onTouchTap={onTouchTap}
                >
                  {icon}
                </IconButton>
              ))}
              {(showMoreButton) ? (
                <IconMenu
                  iconButtonElement={(
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
                      .map(({ icon, tooltip, onTouchTap }, i) => (
                        <MenuItem
                          primaryText={tooltip}
                          leftIcon={icon}
                          key={`dMenuItem_${i}`}
                          onTouchTap={onTouchTap}
                        />
                      ))
                  }
                </IconMenu>
              ) : null}
            </CardActions>
            {hasDict ? (
              <CardText expandable>
                <Dictionary output={output} />
              </CardText>
            ) : null}
          </Card>
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
      onLanguageTouchTap, onSwapButtonTouchTap,
      onKeyDown, onInputText,
      onClearButtonTouchTap,
      onListenButtonTouchTap,
      onWriteButtonTouchTap,
      onTranslateButtonTouchTap,
    } = this.props;
    const styles = this.getStyles();

    const controllers = [
      {
        icon: <ContentClear />,
        tooltip: strings.clear,
        onTouchTap: onClearButtonTouchTap,
      },
      {
        icon: textToSpeechPlaying ? <AVStop /> : <AVVolumeUp />,
        tooltip: textToSpeechPlaying ? strings.stop : strings.listen,
        onTouchTap: () => onListenButtonTouchTap(textToSpeechPlaying, inputLang, inputText),
      },
      {
        icon: <AVMic />,
        tooltip: strings.speak,
      },
      {
        icon: <ContentGesture />,
        tooltip: strings.draw,
        onTouchTap: onWriteButtonTouchTap,
      },
      {
        icon: <ImageCameraAlt />,
        tooltip: strings.camera,
      },
    ];

    const maxVisibleIcon = Math.min(Math.round((screenWidth - 200) / 56), controllers.length);
    const showMoreButton = (maxVisibleIcon < controllers.length);

    return (
      <div style={styles.container}>
        <AppBar
          showMenuIconButton={false}
          title={(
            <div style={styles.innerContainer}>
              <div style={styles.languageTitle} onTouchTap={() => onLanguageTouchTap('inputLang')}>
                <span style={styles.languageTitleSpan}>{strings[inputLang]}</span>
                <div style={styles.dropDownIconContainer}>
                  <NavigationArrowDropDown color={fullWhite} />
                </div>
              </div>
              <div style={styles.swapIconContainer} onTouchTap={onSwapButtonTouchTap}>
                <IconButton>
                  <ActionSwapHoriz color={fullWhite} />
                </IconButton>
              </div>
              <div style={styles.languageTitle} onTouchTap={() => onLanguageTouchTap('outputLang')}>
                <span style={styles.languageTitleSpan}>{strings[outputLang]}</span>
                <div style={styles.dropDownIconContainer}>
                  <NavigationArrowDropDown color={fullWhite} />
                </div>
              </div>
            </div>
          )}
        />
        <Paper zDepth={2} style={styles.inputContainer}>
          <textarea
            style={styles.textarea}
            placeholder="Type something here..."
            onKeyDown={translateWhenPressingEnter ? e => onKeyDown(e) : null}
            onInput={onInputText}
            onKeyUp={onInputText}
            onTouchTap={onInputText}
            onChange={onInputText}
            value={inputText}
          />
          <div style={styles.controllerContainer}>
            <div style={styles.controllerContainerLeft}>
              {controllers.slice(0, maxVisibleIcon).map(({ icon, tooltip, onTouchTap }, i) => (
                <IconButton
                  tooltip={tooltip}
                  tooltipPosition="bottom-center"
                  key={`cIconButton_${i}`}
                  onTouchTap={onTouchTap}
                >
                  {icon}
                </IconButton>
              ))}
              {(showMoreButton) ? (
                <IconMenu
                  iconButtonElement={(
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
                      .map(({ icon, tooltip, onTouchTap }, i) => (
                        <MenuItem
                          primaryText={tooltip}
                          leftIcon={icon}
                          key={`cMenuItem_${i}`}
                          onTouchTap={onTouchTap}
                        />
                      ))
                  }
                </IconMenu>
              ) : null}
            </div>
            <div style={styles.controllerContainerRight}>
              <RaisedButton label="Translate" primary onTouchTap={onTranslateButtonTouchTap} />
            </div>
          </div>
        </Paper>
        <div style={styles.resultContainer}>
          {this.renderOutput(styles)}
        </div>

        {imeMode === 'handwriting' ? <Handwriting /> : null}
      </div>
    );
  }
}

Home.propTypes = {
  screenWidth: React.PropTypes.number,
  theme: React.PropTypes.string,
  translateWhenPressingEnter: React.PropTypes.bool,
  inputLang: React.PropTypes.string,
  outputLang: React.PropTypes.string,
  inputText: React.PropTypes.string,
  output: React.PropTypes.instanceOf(Immutable.Map),
  imeMode: React.PropTypes.string,
  textToSpeechPlaying: React.PropTypes.bool,
  onLanguageTouchTap: React.PropTypes.func,
  onSwapButtonTouchTap: React.PropTypes.func,
  onKeyDown: React.PropTypes.func,
  onInputText: React.PropTypes.func,
  onClearButtonTouchTap: React.PropTypes.func,
  onListenButtonTouchTap: React.PropTypes.func,
  onTranslateButtonTouchTap: React.PropTypes.func,
  onWriteButtonTouchTap: React.PropTypes.func,
};

const mapStateToProps = state => ({
  screenWidth: state.screen.screenWidth,
  theme: state.settings.theme,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  inputText: state.home.inputText,
  output: state.home.output,
  imeMode: state.home.imeMode,
  textToSpeechPlaying: state.textToSpeech.textToSpeechPlaying,
});

const mapDispatchToProps = dispatch => ({
  onLanguageTouchTap: (type) => {
    dispatch(push({
      pathname: '/language-list',
      query: { type },
    }));
  },
  onSwapButtonTouchTap: () => {
    dispatch(swapLanguages());
  },
  onKeyDown: (e) => {
    if ((e.keyCode || e.which) === 13) {
      dispatch(translate());
      e.target.blur();
    }

    const inputText = e.target.value;

    dispatch(updateInputText(inputText, e.target.selectionStart, e.target.selectionEnd));
  },
  onInputText: (e) => {
    const inputText = e.target.value;

    dispatch(updateInputText(inputText, e.target.selectionStart, e.target.selectionEnd));
  },
  onClearButtonTouchTap: () => {
    dispatch(updateInputText(''));
  },
  onListenButtonTouchTap: (toStop, lang, text) => {
    if (toStop) {
      dispatch(stopTextToSpeech());
      return;
    }
    dispatch(playTextToSpeech(lang, text));
  },
  onTranslateButtonTouchTap: () => {
    dispatch(translate());
  },
  onWriteButtonTouchTap: () => {
    dispatch(updateImeMode('handwriting'));
    /* if (isFull() !== true) {
      showUpgradeDialog();
    } else {
      dispatch(switchIme('handwriting'));
    }*/
  },
});

Home.contextTypes = {
  muiTheme: React.PropTypes.object,
};

export default connect(
  mapStateToProps, mapDispatchToProps
)(Home);
