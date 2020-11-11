/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global document */
import React from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import CloseIcon from '@material-ui/icons/Close';
import NavigationMoreVertIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

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
  controllers: {
    bottom: theme.spacing(1),
    left: 0,
    right: 0,
    position: 'absolute',
    margin: '0 auto',
    width: theme.spacing(30),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    display: 'flex',
  },
  controllersLeft: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(1),
  },
});

class Ocr extends React.Component {
  constructor(props) {
    super(props);

    this.handleEscKey = this.handleEscKey.bind(this);
  }

  componentDidMount() {
    const { imageUrl, onChangeRoute } = this.props;

    if (!imageUrl) {
      onChangeRoute(ROUTE_HOME);
    }

    document.addEventListener('keydown', this.handleEscKey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
  }

  handleEscKey(evt) {
    const { zoomLevel, onChangeRoute, onSetZoomLevel } = this.props;
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      onChangeRoute(ROUTE_HOME);
    } else if ((evt.metaKey || evt.ctrlKey) && evt.key === '=') {
      if (zoomLevel + 0.1 > 10) return;
      onSetZoomLevel(zoomLevel + 0.1);
    } else if ((evt.metaKey || evt.ctrlKey) && evt.key === '-') {
      if (zoomLevel - 0.1 < 0.1) return;
      onSetZoomLevel(zoomLevel - 0.1);
    }
  }

  render() {
    const {
      classes,
      imageUrl,
      imageHeight,
      imageWidth,
      inputLang,
      inputText,
      lines,
      mode,
      onChangeRoute,
      onLoadOutput,
      onOpenSnackbar,
      onSetMode,
      onSetZoomLevel,
      outputLang,
      outputText,
      zoomLevel,
    } = this.props;

    const { remote } = window.require('electron');

    if (!imageUrl) return null;

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
            style={{ zoom: zoomLevel || 1, position: 'relative' }}
          >
            {lines.map((line) => (
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
            <img
              src={imageUrl}
              alt=""
              style={{
                height: imageHeight,
                width: imageWidth,
              }}
            />
          </div>
        </div>
        <Paper className={classes.controllers}>
          <div className={classes.controllersLeft}>
            <Typography variant="body2">
              {`${Math.round(zoomLevel * 100)}%`}
            </Typography>
          </div>
          <div className={classes.controllersRight}>
            <Tooltip title={getLocale('zoomOut')} placement="top">
              <IconButton
                size="small"
                aria-label={getLocale('zoomOut')}
                onClick={() => {
                  if (zoomLevel - 0.1 < 0.1) return;
                  onSetZoomLevel(zoomLevel - 0.1);
                }}
              >
                <RemoveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={getLocale('zoomIn')} placement="top">
              <IconButton
                size="small"
                aria-label={getLocale('zoomIn')}
                onClick={() => {
                  if (zoomLevel + 0.1 > 10) return;
                  onSetZoomLevel(zoomLevel + 0.1);
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              onClick={() => onSetZoomLevel(1)}
            >
              {getLocale('reset')}
            </Button>
            <EnhancedMenu
              id="ocrMore"
              buttonElement={(
                <Tooltip title={getLocale('more')} placement="top">
                  <IconButton
                    className={classes.moreButton}
                    size="small"
                    aria-label={getLocale('more')}
                  >
                    <NavigationMoreVertIcon />
                  </IconButton>
                </Tooltip>
              )}
            >
              <MenuItem
                dense
                onClick={() => {
                  const newMode = mode === 'input' ? 'output' : 'input';
                  onSetMode(newMode);
                }}
              >
                {mode === 'input'
                  ? `${getLocale('displayTranslatedText')} (${getLocale(outputLang)})`
                  : `${getLocale('displayOriginalText')} (${getLocale(inputLang)})`}
              </MenuItem>
              <MenuItem
                dense
                onClick={() => {
                  remote.clipboard.writeText(inputText);
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
                  remote.clipboard.writeText(outputText);
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
                    inputText,
                    outputText,
                  });
                  onChangeRoute(ROUTE_HOME);
                }}
              >
                {getLocale('displayTextOnly')}
              </MenuItem>
            </EnhancedMenu>
          </div>
        </Paper>
      </div>
    );
  }
}

Ocr.defaultProps = {
  imageUrl: null,
  imageHeight: 0,
  imageWidth: 0,
  inputText: '',
  lines: [],
  mode: 'input',
  outputText: '',
  zoomLevel: 1,
};

Ocr.propTypes = {
  classes: PropTypes.object.isRequired,
  imageUrl: PropTypes.string,
  imageHeight: PropTypes.number,
  imageWidth: PropTypes.number,
  inputLang: PropTypes.string.isRequired,
  inputText: PropTypes.string,
  lines: PropTypes.array,
  mode: PropTypes.string,
  onChangeRoute: PropTypes.func.isRequired,
  onLoadOutput: PropTypes.func.isRequired,
  onOpenSnackbar: PropTypes.func.isRequired,
  onSetMode: PropTypes.func.isRequired,
  onSetZoomLevel: PropTypes.func.isRequired,
  outputLang: PropTypes.string.isRequired,
  outputText: PropTypes.string,
  zoomLevel: PropTypes.number,
};

const mapStateToProps = (state) => ({
  imageUrl: state.pages.ocr ? state.pages.ocr.imageUrl : undefined,
  imageHeight: state.pages.ocr ? state.pages.ocr.imageHeight : undefined,
  imageWidth: state.pages.ocr ? state.pages.ocr.imageWidth : undefined,
  inputLang: state.preferences.inputLang,
  inputText: state.pages.ocr ? state.pages.ocr.inputText : undefined,
  lines: state.pages.ocr ? state.pages.ocr[`${state.pages.ocr.mode || 'output'}Lines`] : undefined,
  mode: state.pages.ocr ? state.pages.ocr.mode : undefined,
  outputLang: state.preferences.outputLang,
  outputText: state.pages.ocr ? state.pages.ocr.outputText : undefined,
  zoomLevel: state.pages.ocr ? state.pages.ocr.zoomLevel : undefined,
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
