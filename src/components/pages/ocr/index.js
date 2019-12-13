import React from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import CloseIcon from '@material-ui/icons/Close';
import NavigationMoreVert from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import EnhancedMenu from '../../shared/enhanced-menu';

import { setZoomLevel, setMode } from '../../../state/pages/ocr/actions';
import { loadOutput } from '../../../state/pages/home/actions';
import { openSnackbar } from '../../../state/root/snackbar/actions';
import { changeRoute } from '../../../state/root/router/actions';

import { ROUTE_HOME } from '../../../constants/routes';

const { remote } = window.require('electron');

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
    const { ocr, onChangeRoute } = this.props;

    if (!ocr) {
      onChangeRoute(ROUTE_HOME);
    }
  }

  render() {
    const {
      classes,
      inputLang,
      ocr,
      onChangeRoute,
      onLoadOutput,
      onOpenSnackbar,
      onSetMode,
      onSetZoomLevel,
      outputLang,
    } = this.props;

    if (!ocr) return null;

    const lineVarName = `${ocr.mode || 'ouLatput'}Lines`;

    return (
      <div className={classes.container}>
        <Fab
          className={classes.closeButton}
          onClick={() => onChangeRoute(ROUTE_HOME)}
        >
          <CloseIcon />
        </Fab>
        <div className={classes.zoomContainer}>
          <div
            style={{ zoom: ocr.zoomLevel || 1, position: 'relative' }}
          >
            {ocr[lineVarName].map((line) => (
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
        <Fab
          className={classes.minusButton}
          onClick={() => {
            if (ocr.zoomLevel < 0.1) return;
            onSetZoomLevel(ocr.zoomLevel - 0.1 || 1);
          }}
        >
          <ZoomOutIcon />
        </Fab>
        <Fab
          className={classes.plusButton}
          onClick={() => onSetZoomLevel(ocr.zoomLevel + 0.1 || 1)}
        >
          <ZoomInIcon />
        </Fab>
        <EnhancedMenu
          id="ocrMore"
          buttonElement={(
            <IconButton className={classes.moreButton}>
              <NavigationMoreVert color="#fff" />
            </IconButton>
          )}
        >
          <MenuItem
            onClick={() => {
              const newMode = ocr.mode === 'input' ? 'output' : 'input';
              onSetMode(newMode);
            }}
          >
            {ocr.mode === 'input'
              ? `${getLocale('displayTranslatedText')} (${getLocale(outputLang)})`
              : `${getLocale('displayOriginalText')} (${getLocale(inputLang)})`}
          </MenuItem>
          <MenuItem
            onClick={() => {
              remote.clipboard.writeText(ocr.inputText);
              onOpenSnackbar(getLocale('copied'));
            }}
          >
            {getLocale('copyOriginalText')}
            {' '}
(
            {getLocale(inputLang)}
)
          </MenuItem>
          <MenuItem
            onClick={() => {
              remote.clipboard.writeText(ocr.outputText);
              onOpenSnackbar(getLocale('copied'));
            }}
          >
            {getLocale('copyTranslatedText')}
            {' '}
(
            {getLocale(outputLang)}
)
          </MenuItem>
          <MenuItem
            onClick={() => {
              onLoadOutput({
                inputLang,
                outputLang,
                inputText: ocr.inputText,
                outputText: ocr.outputText,
              });
              onChangeRoute(ROUTE_HOME);
            }}
          >
            {getLocale('displayTextOnly')}
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
  onChangeRoute: PropTypes.func.isRequired,
  onLoadOutput: PropTypes.func.isRequired,
  onOpenSnackbar: PropTypes.func.isRequired,
  onSetMode: PropTypes.func.isRequired,
  onSetZoomLevel: PropTypes.func.isRequired,
  outputLang: PropTypes.string,
};

const mapStateToProps = (state) => ({
  inputLang: state.preferences.inputLang,
  outputLang: state.preferences.outputLang,
  ocr: state.pages.ocr,
});

const actionCreators = {
  changeRoute,
  loadOutput,
  openSnackbar,
  setMode,
  setZoomLevel,
};

export default connectComponent(
  Ocr,
  mapStateToProps,
  actionCreators,
  styles,
);
