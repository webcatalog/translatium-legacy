/* global document */
import React from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';

import CloseIcon from '@material-ui/icons/Close';
import NavigationMoreVert from '@material-ui/icons/MoreVert';
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

const styles = (theme) => ({
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
  line: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    whiteSpace: 'nowrap',
    position: 'absolute',
    cursor: 'pointer',
    '&:focus, &:active': {
      outlineColor: theme.palette.primary.main,
      outlineStyle: 'auto',
      outlineWidth: 5,
    },
  },
  ocrImage: {
    maxWidth: 1500,
  },
});

class Ocr extends React.Component {
  constructor(props) {
    super(props);

    this.handleEscKey = this.handleEscKey.bind(this);
  }

  componentDidMount() {
    const { ocr, onChangeRoute } = this.props;

    if (!ocr) {
      onChangeRoute(ROUTE_HOME);
    }

    document.addEventListener('keydown', this.handleEscKey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
  }

  handleEscKey(evt) {
    const { ocr, onChangeRoute, onSetZoomLevel } = this.props;
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      onChangeRoute(ROUTE_HOME);
    } else if ((evt.metaKey || evt.ctrlKey) && evt.key === '=') {
      onSetZoomLevel(ocr.zoomLevel + 0.1 || 1);
    } else if ((evt.metaKey || evt.ctrlKey) && evt.key === '-') {
      if (ocr.zoomLevel < 0.1) return;
      onSetZoomLevel(ocr.zoomLevel - 0.1 || 1);
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

    const { remote } = window.require('electron');

    if (!ocr) return null;

    const lineVarName = `${ocr.mode || 'output'}Lines`;

    return (
      <div
        className={classes.container}
      >
        <Tooltip title={getLocale('close')} placement="right">
          <Fab
            className={classes.closeButton}
            size="small"
            onClick={() => onChangeRoute(ROUTE_HOME)}
          >
            <CloseIcon />
          </Fab>
        </Tooltip>
        <div className={classes.zoomContainer}>
          <div
            style={{ zoom: ocr.zoomLevel || 1, position: 'relative', touchAction: 'pinch-zoom' }}
          >
            {ocr[lineVarName].map((line) => (
              <div
                role="button"
                tabIndex={0}
                key={`ocrText_${line.text}_${line.top}_${line.left}`}
                className={classes.line}
                style={{
                  top: line.top,
                  left: line.left,
                  fontSize: line.height,
                  lineHeight: `${line.height}px`,
                }}
                onClick={() => {
                  remote.clipboard.writeText(line.text);
                  onOpenSnackbar(getLocale('copied'));
                }}
              >
                {line.text}
              </div>
            ))}
            <img src={ocr.imageUrl} className={classes.ocrImage} alt="" />
          </div>
        </div>
        <Tooltip title={getLocale('zoomOut')} placement="top">
          <Fab
            className={classes.minusButton}
            size="small"
            aria-label={getLocale('zoomOut')}
            onClick={() => {
              if (ocr.zoomLevel < 0.1) return;
              onSetZoomLevel(ocr.zoomLevel - 0.1 || 1);
            }}
          >
            <ZoomOutIcon />
          </Fab>
        </Tooltip>
        <Tooltip title={getLocale('zoomIn')} placement="top">
          <Fab
            className={classes.plusButton}
            size="small"
            aria-label={getLocale('zoomIn')}
            onClick={() => onSetZoomLevel(ocr.zoomLevel + 0.1 || 1)}
          >
            <ZoomInIcon />
          </Fab>
        </Tooltip>
        <EnhancedMenu
          id="ocrMore"
          buttonElement={(
            <Tooltip title={getLocale('more')} placement="top">
              <Fab className={classes.moreButton} size="small" aria-label={getLocale('more')}>
                <NavigationMoreVert />
              </Fab>
            </Tooltip>
          )}
        >
          <MenuItem
            dense
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
            dense
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
            dense
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
            dense
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
  inputLang: PropTypes.string.isRequired,
  ocr: PropTypes.object.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  onLoadOutput: PropTypes.func.isRequired,
  onOpenSnackbar: PropTypes.func.isRequired,
  onSetMode: PropTypes.func.isRequired,
  onSetZoomLevel: PropTypes.func.isRequired,
  outputLang: PropTypes.string.isRequired,
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
