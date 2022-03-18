/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useCallback, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';

import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import getLocale from '../../../helpers/get-locale';

import { updateLanguageListSearch as updateQuery } from '../../../state/pages/language-list/actions';

import { ROUTE_LANGUAGE_LIST } from '../../../constants/routes';

const useStyles = makeStyles((theme) => ({
  toolbarSearchContainer: {
    flex: 0,
    zIndex: 10,
    position: 'relative',
    borderRadius: 0,
    paddingRight: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
  },
  toolbarSectionSearch: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: 40,
    margin: '0 auto',
  },
  searchBarText: {
    lineHeight: 1.5,
    padding: '0 4px',
    flex: 1,
    userSelect: 'none',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    transform: 'translateY(-1px)',
    fontWeight: 'normal',
  },
  input: {
    font: 'inherit',
    border: 0,
    display: 'block',
    verticalAlign: 'middle',
    whiteSpace: 'normal',
    background: 'none',
    margin: 0,
    color: theme.palette.text.primary,
    width: '100%',
    padding: 0,
    '&:focus': {
      outline: 0,
    },
    '&::placeholder': {
      color: theme.palette.text.secondary,
    },
  },
  searchButton: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbarIconButton: {
    padding: theme.spacing(1),
  },
}));

const SearchBox = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const query = useSelector((state) => state.pages.languageList.search);
  const route = useSelector((state) => state.router.route);

  const inputRef = useRef(null);
  // https://stackoverflow.com/a/57556594
  // Event handler utilizing useCallback ...
  // ... so that reference never changes.
  const handleOpenFind = useCallback(() => {
    if (route !== ROUTE_LANGUAGE_LIST) return;
    inputRef.current.focus();
    inputRef.current.select();
  }, [inputRef, route]);
  useEffect(() => {
    ipcRenderer.on('open-find', handleOpenFind);
    // Remove event listener on cleanup
    return () => {
      ipcRenderer.removeListener('open-find', handleOpenFind);
    };
  }, [inputRef, handleOpenFind]);

  useEffect(() => {
    if (route !== ROUTE_LANGUAGE_LIST) return;
    // focus on first load
    // https://github.com/webcatalog/translatium-desktop/issues/347
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [route]);

  const clearSearchAction = query.length > 0 && (
    <Tooltip title={getLocale('clear')} placement="left">
      <IconButton
        color="default"
        aria-label={getLocale('clear')}
        onClick={() => dispatch(updateQuery(''))}
        className={classes.toolbarIconButton}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Paper elevation={1} className={classes.toolbarSearchContainer}>
      <div className={classes.toolbarSectionSearch}>
        <Typography
          className={classes.searchBarText}
          color="inherit"
          variant="body1"
        >
          <input
            ref={inputRef}
            className={classes.input}
            onChange={(e) => dispatch(updateQuery(e.target.value))}
            onInput={(e) => dispatch(updateQuery(e.target.value))}
            onKeyDown={(e) => {
              if ((e.keyCode || e.which) === 27) { // Escape
                if (query === '') {
                  e.target.blur();
                } else {
                  dispatch(updateQuery(''));
                }
              }
            }}
            onBlur={() => {
              window.preventEsc = false;
            }}
            onFocus={() => {
              window.preventEsc = true;
            }}
            placeholder={getLocale('searchLanguages')}
            value={query}
          />
        </Typography>
        {clearSearchAction}
      </div>
    </Paper>
  );
};

export default SearchBox;
