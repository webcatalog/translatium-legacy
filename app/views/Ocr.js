/* global strings */

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Immutable from 'immutable';

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
        height: '100%',
        display: 'flex',
        position: 'relative',
        backgroundColor: '#000',
      },
      closeButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 100,
      },
      zoomContainer: {
        flex: 1,
        height: '100%',
        width: '100%',
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
      inputLang, outputLang,
      ocr, onCloseTouchTap, onZoomSliderChange,
      onModeMenuItemTouchTap, onTextOnlyMenuItemTouchTap,
    } = this.props;

    if (!ocr) return null;

    const lineVarName = `${ocr.get('mode') || 'output'}Lines`;

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
            style={{ zoom: ocr.get('zoomLevel') || 1, position: 'relative' }}
          >
            {ocr.get(lineVarName).map((line, i) => (
              <div
                key={`key_${i}`}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  position: 'absolute',
                  top: line.get('top'),
                  left: line.get('left'),
                  fontSize: line.get('height'),
                  lineHeight: `${line.get('height')}px`,
                }}
              >
                {line.get('text')}
              </div>
            ))}
            <img src={ocr.get('imageUrl')} role="presentation" />
          </div>
        </div>
        <Slider
          style={styles.slider}
          min={0.1}
          max={3}
          step={0.1}
          defaultValue={1}
          value={ocr.get('zoomLevel')}
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
              ocr.get('mode') === 'input'
                ? `${strings.displayTranslatedText} (${strings[outputLang]})`
                : `${strings.displayOriginalText} (${strings[inputLang]})`
            }
            onTouchTap={() => onModeMenuItemTouchTap(ocr.get('mode'))}
          />
          <MenuItem
            primaryText="Display text only"
            onTouchTap={() => onTextOnlyMenuItemTouchTap(
              inputLang, outputLang, ocr.get('inputText'), ocr.get('outputText')
            )}
          />
        </IconMenu>
      </div>
    );
  }
}

Ocr.propTypes = {
  inputLang: React.PropTypes.string,
  outputLang: React.PropTypes.string,
  ocr: React.PropTypes.instanceOf(Immutable.Map),
  onCloseTouchTap: React.PropTypes.func,
  onZoomSliderChange: React.PropTypes.func,
  onModeMenuItemTouchTap: React.PropTypes.func,
  onTextOnlyMenuItemTouchTap: React.PropTypes.func,
};

const mapStateToProps = state => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  ocr: state.ocr,
});

const mapDispatchToProps = dispatch => ({
  onCloseTouchTap: () => {
    dispatch(push('/'));
  },
  onZoomSliderChange: (event, value) => {
    dispatch(setZoomLevel(value));
  },
  onModeMenuItemTouchTap: (currentMode) => {
    let newMode;
    if (currentMode === 'input') newMode = 'output';
    else newMode = 'input';

    dispatch(setMode(newMode));
  },
  onTextOnlyMenuItemTouchTap: (inputLang, outputLang, inputText, outputText) => {
    dispatch(loadOutput(Immutable.fromJS({
      inputLang, outputLang, inputText, outputText,
    })));
    dispatch(push('/'));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Ocr);
