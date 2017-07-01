import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import shortid from 'shortid';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import Slider from 'material-ui/Slider';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';

import { setZoomLevel, setMode } from '../actions/ocr';
import { loadOutput } from '../actions/home';

class Ocr extends React.Component {
  componentDidMount() {
    if (!this.props.ocr) {
      this.props.onCloseTouchTap();
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
      onCloseTouchTap,
      onZoomSliderChange,
      onModeMenuItemTouchTap,
      onTextOnlyMenuItemTouchTap,
    } = this.props;

    if (!ocr) return null;

    const lineVarName = `${ocr.mode || 'output'}Lines`;

    return (
      <div style={styles.container}>
        <FloatingActionButton
          mini
          style={styles.closeButton}
          onTouchTap={onCloseTouchTap}
        >
          <NavigationClose />
        </FloatingActionButton>
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
        <Slider
          style={styles.slider}
          min={0.1}
          max={3}
          step={0.1}
          defaultValue={1}
          value={ocr.zoomLevel}
          onChange={onZoomSliderChange}
        />
        <IconMenu
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
            onTouchTap={() => onModeMenuItemTouchTap(ocr.mode)}
          />
          <MenuItem
            primaryText="Display text only"
            onTouchTap={() => onTextOnlyMenuItemTouchTap(
              inputLang, outputLang, ocr.inputText, ocr.outputText,
            )}
          />
        </IconMenu>
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
  onCloseTouchTap: PropTypes.func.isRequired,
  onZoomSliderChange: PropTypes.func.isRequired,
  onModeMenuItemTouchTap: PropTypes.func.isRequired,
  onTextOnlyMenuItemTouchTap: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  ocr: state.ocr,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onCloseTouchTap: () => dispatch(goBack()),
  onZoomSliderChange: (event, value) => dispatch(setZoomLevel(value)),
  onModeMenuItemTouchTap: (currentMode) => {
    let newMode;
    if (currentMode === 'input') newMode = 'output';
    else newMode = 'input';

    dispatch(setMode(newMode));
  },
  onTextOnlyMenuItemTouchTap: (inputLang, outputLang, inputText, outputText) => {
    dispatch(loadOutput({
      inputLang, outputLang, inputText, outputText,
    }));
    dispatch(goBack());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Ocr);
