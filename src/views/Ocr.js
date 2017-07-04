import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import shortid from 'shortid';

import Button from 'material-ui/Button';
import NavigationClose from 'material-ui-icons/Close';
import NavigationMoreVert from 'material-ui-icons/MoreVert';
// import Slider from 'material-ui/Slider';
import { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';

import EnhancedMenu from './EnhancedMenu';

import { setZoomLevel, setMode } from '../actions/ocr';
import { loadOutput } from '../actions/home';

class Ocr extends React.Component {
  componentDidMount() {
    if (!this.props.ocr) {
      this.props.onCloseClick();
    }
  }

  getStyles() {
    return {
      container: {
        flex: 1,
        display: 'flex',
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
      },
      closeButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 100,
      },
      zoomContainer: {
        flex: 1,
        overflow: 'auto',
        padding: 56,
        boxSizing: 'border-box',
        position: 'relative',
      },
      moreButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 100,
      },
      slider: {
        width: 200,
        position: 'absolute',
        bottom: -16,
        left: 16,
      },
    };
  }

  render() {
    const styles = this.getStyles();
    const {
      inputLang,
      outputLang,
      ocr,
      strings,
      onCloseClick,
      onZoomSliderChange,
      onModeMenuItemClick,
      onTextOnlyMenuItemClick,
    } = this.props;

    if (!ocr) return null;

    const lineVarName = `${ocr.mode || 'output'}Lines`;

    return (
      <div style={styles.container}>
        <Button
          fab
          dense
          style={styles.closeButton}
          onClick={onCloseClick}
        >
          <NavigationClose />
        </Button>
        <div style={styles.zoomContainer}>
          <div
            style={{ zoom: ocr.zoomLevel || 1, position: 'relative' }}
          >
            {ocr[lineVarName].map(line => (
              <div
                key={shortid.generate()}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  position: 'absolute',
                  top: line.top,
                  left: line.left,
                  fontSize: line.height,
                  lineHeight: `${line.height}px`,
                }}
              >
                {line.text}
              </div>
            ))}
            <img src={ocr.imageUrl} alt="" />
          </div>
        </div>
        <div
          style={styles.slider}
          min={0.1}
          max={3}
          step={0.1}
          defaultValue={1}
          value={ocr.zoomLevel}
          onChange={onZoomSliderChange}
        />
        <EnhancedMenu
          id="ocrMore"
          iconButtonElement={(
            <IconButton
              style={styles.moreButton}
            >
              <NavigationMoreVert color="#fff" />
            </IconButton>
          )}
        >
          <MenuItem
            primaryText={
              ocr.mode === 'input'
                ? `${strings.displayTranslatedText} (${strings[outputLang]})`
                : `${strings.displayOriginalText} (${strings[inputLang]})`
            }
            onClick={() => onModeMenuItemClick(ocr.mode)}
          />
          <MenuItem
            primaryText="Display text only"
            onClick={() => onTextOnlyMenuItemClick(
              inputLang, outputLang, ocr.inputText, ocr.outputText,
            )}
          />
        </EnhancedMenu>
      </div>
    );
  }
}

Ocr.propTypes = {
  inputLang: PropTypes.string,
  outputLang: PropTypes.string,
  // eslint-disable-next-line
  ocr: PropTypes.object,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onZoomSliderChange: PropTypes.func.isRequired,
  onModeMenuItemClick: PropTypes.func.isRequired,
  onTextOnlyMenuItemClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  ocr: state.ocr,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onCloseClick: () => dispatch(goBack()),
  onZoomSliderChange: (event, value) => dispatch(setZoomLevel(value)),
  onModeMenuItemClick: (currentMode) => {
    let newMode;
    if (currentMode === 'input') newMode = 'output';
    else newMode = 'input';

    dispatch(setMode(newMode));
  },
  onTextOnlyMenuItemClick: (inputLang, outputLang, inputText, outputText) => {
    dispatch(loadOutput({
      inputLang, outputLang, inputText, outputText,
    }));
    dispatch(goBack());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Ocr);
