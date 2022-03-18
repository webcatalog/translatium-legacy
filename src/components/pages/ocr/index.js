/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global document */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { clipboard } from '@electron/remote';

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

import getLocale from '../../../helpers/get-locale';

import EnhancedMenu from '../../shared/enhanced-menu';

import { setZoomLevel, setMode } from '../../../state/pages/ocr/actions';
import { loadOutput } from '../../../state/pages/home/actions';
import { openSnackbar } from '../../../state/root/snackbar/actions';
import { changeRoute } from '../../../state/root/router/actions';

import { ROUTE_HOME } from '../../../constants/routes';

const useStyles = makeStyles((theme) => ({
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
}));

const Ocr = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const imageUrl = useSelector((state) => (state.pages.ocr ? state.pages.ocr.imageUrl : undefined));
  const imageHeight = useSelector(
    (state) => (state.pages.ocr ? state.pages.ocr.imageHeight : undefined) || 0,
  );
  const imageWidth = useSelector(
    (state) => (state.pages.ocr ? state.pages.ocr.imageWidth : undefined) || 0,
  );
  const inputLang = useSelector((state) => state.preferences.inputLang);
  const inputText = useSelector(
    (state) => (state.pages.ocr ? state.pages.ocr.inputText : undefined) || '',
  );
  const lines = useSelector(
    (state) => (state.pages.ocr ? state.pages.ocr[`${state.pages.ocr.mode || 'output'}Lines`] : undefined) || [],
  );
  const mode = useSelector((state) => (state.pages.ocr ? state.pages.ocr.mode : undefined) || 'input');
  const outputLang = useSelector((state) => state.preferences.outputLang);
  const outputText = useSelector(
    (state) => (state.pages.ocr ? state.pages.ocr.outputText : undefined) || '',
  );
  const zoomLevel = useSelector(
    (state) => (state.pages.ocr ? state.pages.ocr.zoomLevel : undefined) || 1,
  );

  useEffect(() => {
    if (!imageUrl) {
      dispatch(changeRoute(ROUTE_HOME));
    }
  }, [imageUrl, dispatch]);

  useEffect(() => {
    const handleEscKey = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        dispatch(changeRoute(ROUTE_HOME));
      } else if ((evt.metaKey || evt.ctrlKey) && evt.key === '=') {
        if (zoomLevel + 0.1 > 10) return;
        dispatch(setZoomLevel(zoomLevel + 0.1));
      } else if ((evt.metaKey || evt.ctrlKey) && evt.key === '-') {
        if (zoomLevel - 0.1 < 0.1) return;
        dispatch(setZoomLevel(zoomLevel - 0.1));
      }
    };
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [zoomLevel, dispatch]);

  if (!imageUrl) return null;

  return (
    <div
      className={classes.container}
    >
      <Tooltip title={getLocale('close')} placement="right">
        <Fab
          className={classes.closeButton}
          size="small"
          onClick={() => dispatch(changeRoute(ROUTE_HOME))}
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
                clipboard.writeText(line.text);
                dispatch(openSnackbar(getLocale('copied')));
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
                dispatch(setZoomLevel(zoomLevel - 0.1));
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
                dispatch(setZoomLevel(zoomLevel + 0.1));
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            onClick={() => dispatch(setZoomLevel(1))}
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
                dispatch(setMode(newMode));
              }}
            >
              {mode === 'input'
                ? `${getLocale('displayTranslatedText')} (${getLocale(outputLang)})`
                : `${getLocale('displayOriginalText')} (${getLocale(inputLang)})`}
            </MenuItem>
            <MenuItem
              dense
              onClick={() => {
                clipboard.writeText(inputText);
                dispatch(openSnackbar(getLocale('copied')));
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
                clipboard.writeText(outputText);
                dispatch(openSnackbar(getLocale('copied')));
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
                dispatch(loadOutput({
                  inputLang,
                  outputLang,
                  inputText,
                  outputText,
                }));
                dispatch(changeRoute(ROUTE_HOME));
              }}
            >
              {getLocale('displayTextOnly')}
            </MenuItem>
          </EnhancedMenu>
        </div>
      </Paper>
    </div>
  );
};

export default Ocr;
