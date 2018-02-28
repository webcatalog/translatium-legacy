import React from 'react';
import PropTypes from 'prop-types';
import { goBack } from 'react-router-redux';

import Button from 'material-ui/Button';
import CloseIcon from 'material-ui-icons/Close';
import NavigationMoreVert from 'material-ui-icons/MoreVert';
import { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import ZoomInIcon from 'material-ui-icons/ZoomIn';
import ZoomOutIcon from 'material-ui-icons/ZoomOut';

import connectComponent from '../../helpers/connect-component';

import EnhancedMenu from './enhanced-menu';

import { setZoomLevel, setMode } from '../../state/pages/ocr/actions';
import { loadOutput } from '../../state/pages/home/actions';
import { openSnackbar } from '../../state/root/snackbar/actions';

import copyToClipboard from '../../helpers/copy-to-clipboard';

const styles = {
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
  minusButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    zIndex: 100,
  },
  plusButton: {
    position: 'absolute',
    bottom: 16,
    left: 96,
    zIndex: 100,
  },
};

class Ocr extends React.Component {
  componentDidMount() {
    if (!this.props.ocr) {
      this.props.onCloseClick();
    }
  }

  render() {
    const {
      classes,
      inputLang,
      ocr,
      onCloseClick,
      onModeMenuItemClick,
      onRequestCopyToClipboard,
      onTextOnlyMenuItemClick,
      onUpdateZoomLevel,
      outputLang,
      strings,
    } = this.props;

    if (!ocr) return null;

    const lineVarName = `${ocr.mode || 'output'}Lines`;

    return (
      <div className={classes.container}>
        <Button
          fab
          dense
          className={classes.closeButton}
          onClick={onCloseClick}
        >
          <CloseIcon />
        </Button>
        <div className={classes.zoomContainer}>
          <div
            style={{ zoom: ocr.zoomLevel || 1, position: 'relative' }}
          >
            {ocr[lineVarName].map(line => (
              <div
                key={`ocrText_${line.text}`}
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
        <Button
          fab
          dense
          className={classes.minusButton}
          onClick={() => {
            if (ocr.zoomLevel < 0.1) return;
            onUpdateZoomLevel(ocr.zoomLevel - 0.1 || 1);
          }}
        >
          <ZoomOutIcon />
        </Button>
        <Button
          fab
          dense
          className={classes.plusButton}
          onClick={() => onUpdateZoomLevel(ocr.zoomLevel + 0.1 || 1)}
        >
          <ZoomInIcon />
        </Button>
        <EnhancedMenu
          id="ocrMore"
          buttonElement={(
            <IconButton className={classes.moreButton}>
              <NavigationMoreVert color="#fff" />
            </IconButton>
          )}
        >
          <MenuItem onClick={() => onModeMenuItemClick(ocr.mode)}>
            {ocr.mode === 'input'
              ? `${strings.displayTranslatedText} (${strings[outputLang]})`
              : `${strings.displayOriginalText} (${strings[inputLang]})`}
          </MenuItem>
          <MenuItem
            onClick={() =>
              onRequestCopyToClipboard(ocr.inputText, strings)}
          >
            {strings.copyOriginalText} ({strings[inputLang]})
          </MenuItem>
          <MenuItem
            onClick={() =>
              onRequestCopyToClipboard(ocr.outputText, strings)}
          >
            {strings.copyTranslatedText} ({strings[outputLang]})
          </MenuItem>
          <MenuItem
            onClick={() =>
              onTextOnlyMenuItemClick(inputLang, outputLang, ocr.inputText, ocr.outputText)}
          >
            {strings.displayTextOnly}
          </MenuItem>
        </EnhancedMenu>
      </div>
    );
  }
}

Ocr.propTypes = {
  classes: PropTypes.object.isRequired,
  inputLang: PropTypes.string,
  ocr: PropTypes.object.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onModeMenuItemClick: PropTypes.func.isRequired,
  onRequestCopyToClipboard: PropTypes.func.isRequired,
  onTextOnlyMenuItemClick: PropTypes.func.isRequired,
  onUpdateZoomLevel: PropTypes.func.isRequired,
  outputLang: PropTypes.string,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  ocr: state.pages.ocr,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onCloseClick: () => dispatch(goBack()),
  onUpdateZoomLevel: value => dispatch(setZoomLevel(value)),
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
  onRequestCopyToClipboard: (text, strings) => {
    copyToClipboard(text);
    dispatch(openSnackbar(strings.copied));
  },
});

export default connectComponent(
  Ocr,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
