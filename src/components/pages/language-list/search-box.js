import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { updateLanguageListSearch as updateQuery } from '../../../state/pages/language-list/actions';

import { ROUTE_LANGUAGE_LIST } from '../../../constants/routes';

const styles = (theme) => ({
  toolbarSearchContainer: {
    flex: 0,
    zIndex: 10,
    position: 'relative',
    borderRadius: 0,
    paddingRight: theme.spacing(1.5),
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
    paddingLeft: theme.spacing(1.5),
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
});

const SearchBox = ({
  classes,
  onUpdateQuery,
  query,
  route,
}) => {
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
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.on('open-find', handleOpenFind);
    // Remove event listener on cleanup
    return () => {
      ipcRenderer.removeListener('open-find', handleOpenFind);
    };
  }, [inputRef, handleOpenFind]);

  const clearSearchAction = query.length > 0 && (
    <>
      <IconButton
        color="default"
        aria-label="Clear"
        onClick={() => onUpdateQuery('')}
      >
        <CloseIcon fontSize="small" className={classes.icon} />
      </IconButton>
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
              if ((e.keyCode || e.which) === 27) { // Escape
                onUpdateQuery('');
                e.target.blur();
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

SearchBox.defaultProps = {
  query: '',
};

SearchBox.propTypes = {
  classes: PropTypes.object.isRequired,
  onUpdateQuery: PropTypes.func.isRequired,
  query: PropTypes.string,
  route: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  query: state.pages.languageList.search,
  route: state.router.route,
});

const actionCreators = {
  updateQuery,
};

export default connectComponent(
  SearchBox,
  mapStateToProps,
  actionCreators,
  styles,
);
