/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global document */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import getLocale from '../../../helpers/get-locale';

import { changeRoute } from '../../../state/root/router/actions';
import { ROUTE_HOME, ROUTE_LANGUAGE_LIST } from '../../../constants/routes';

import LanguageListList from './list';
import SearchBox from './search-box';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  title: {
    flexGrow: 1,
  },
  appBarColorDefault: {
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
  },
  toolbar: {
    minHeight: 40,
    paddingRight: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
  },
  toolbarIconButton: {
    padding: theme.spacing(1),
  },
}));

const LanguageList = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const mode = useSelector((state) => state.pages.languageList.mode);
  const route = useSelector((state) => state.router.route);

  useEffect(() => {
    const handleEscKey = (evt) => {
      if (route !== ROUTE_LANGUAGE_LIST || window.preventEsc) {
        return;
      }
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        dispatch(changeRoute(ROUTE_HOME));
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [route, dispatch]);

  return (
    <div className={classes.container}>
      <AppBar position="static" color="default" elevation={0} classes={{ colorDefault: classes.appBarColorDefault }}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <Typography variant="subtitle1" color="inherit" className={classes.title}>
            {mode === 'inputLang' ? getLocale('selectInputLang') : getLocale('selectOutputLang')}
          </Typography>
          <Tooltip title={getLocale('close')} placement="left">
            <IconButton
              color="inherit"
              className={classes.toolbarIconButton}
              aria-label={getLocale('close')}
              onClick={() => dispatch(changeRoute(ROUTE_HOME))}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <SearchBox />
      <LanguageListList />
    </div>
  );
};

export default LanguageList;
