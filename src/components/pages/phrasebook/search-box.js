/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { loadPhrasebook, updateQuery } from '../../../state/pages/phrasebook/actions';

const styles = (theme) => ({
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
});

const SearchBox = ({
  classes,
  onUpdateQuery,
  query,
  onLoadPhrasebook,
}) => {
  const inputRef = useRef(null);
  // https://stackoverflow.com/a/57556594
  // Event handler utilizing useCallback ...
  // ... so that reference never changes.
  const handleOpenFind = useCallback(() => {
    inputRef.current.focus();
    inputRef.current.select();
  }, [inputRef]);
  useEffect(() => {
    window.ipcRenderer.on('open-find', handleOpenFind);
    // Remove event listener on cleanup
    return () => {
      window.ipcRenderer.removeListener('open-find', handleOpenFind);
    };
  }, [handleOpenFind]);

  const clearSearchAction = query.length > 0 && (
    <>
      <Tooltip title={getLocale('clear')}>
        <IconButton
          color="default"
          aria-label={getLocale('clear')}
          onClick={() => onUpdateQuery('')}
          className={classes.toolbarIconButton}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={getLocale('search')}>
        <IconButton
          color="default"
          aria-label={getLocale('search')}
          onClick={() => onLoadPhrasebook(true)}
          className={classes.toolbarIconButton}
        >
          <KeyboardReturnIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
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
            onChange={(e) => onUpdateQuery(e.target.value)}
            onInput={(e) => onUpdateQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.length > 0) {
                onLoadPhrasebook(true);
              } else if (e.key === 'Escape') {
                e.target.blur();
                onUpdateQuery('');
              }
            }}
            placeholder={getLocale('searchSavedTranslations')}
            value={query}
          />
        </Typography>
        {clearSearchAction}
      </div>
    </Paper>
  );
};

SearchBox.defaultProps = {
  query: '',
};

SearchBox.propTypes = {
  classes: PropTypes.object.isRequired,
  onUpdateQuery: PropTypes.func.isRequired,
  onLoadPhrasebook: PropTypes.func.isRequired,
  query: PropTypes.string,
};

const mapStateToProps = (state) => ({
  query: state.pages.phrasebook.query,
});

const actionCreators = {
  updateQuery,
  loadPhrasebook,
};

export default connectComponent(
  SearchBox,
  mapStateToProps,
  actionCreators,
  styles,
);
