/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';

import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import HistoryIcon from '@material-ui/icons/History';
import SearchIcon from '@material-ui/icons/Search';
import ClearAllIcon from '@material-ui/icons/ClearAll';

import getLocale from '../../../helpers/get-locale';

import { ROUTE_HOME } from '../../../constants/routes';

import { deleteHistoryItem, loadHistory, clearAllHistory } from '../../../state/pages/history/actions';
import { loadOutput } from '../../../state/pages/home/actions';
import { changeRoute } from '../../../state/root/router/actions';

import SearchBox from './search-box';

const useStyles = makeStyles((theme) => ({
  emptyContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyInnerContainer: {
    textAlign: 'center',
  },
  bigIcon: {
    height: 96,
    width: 96,
    color: theme.palette.text.primary,
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: 0,
    boxSizing: 'border-box',
  },
  progress: {
    marginTop: 12,
  },
  appBarColorDefault: {
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  toolbar: {
    minHeight: 40,
    paddingRight: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
  },
  appBarMenu: {
    position: 'absolute',
    right: theme.spacing(1.5),
  },
  toolbarIconButton: {
    padding: theme.spacing(1),
  },
}));

const History = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const canLoadMore = useSelector((state) => state.pages.history.canLoadMore);
  const items = useSelector((state) => state.pages.history.items);
  const loading = useSelector((state) => state.pages.history.loading);
  const query = useSelector((state) => state.pages.history.query);

  useEffect(() => {
    dispatch(loadHistory(true));
  }, [dispatch]);

  const onScroll = useCallback((e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight > scrollHeight - 200) {
      if (canLoadMore === true && loading === false) {
        dispatch(loadHistory());
      }
    }
  }, [canLoadMore, loading, dispatch]);

  return (
    <div className={classes.container}>
      <AppBar position="static" color="default" elevation={0} classes={{ colorDefault: classes.appBarColorDefault }}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <Typography variant="subtitle1" color="inherit" className={classes.title}>{getLocale('history')}</Typography>
          <div className={classes.appBarMenu}>
            <Tooltip title={getLocale('clearHistory')} placement="left">
              <IconButton
                color="inherit"
                aria-label={getLocale('clearHistory')}
                className={classes.toolbarIconButton}
                onClick={() => dispatch(clearAllHistory())}
              >
                <ClearAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>
      <SearchBox />
      {(() => {
        if (items.length < 1 && loading === false) {
          return (
            <div className={classes.emptyContainer}>
              <div className={classes.emptyInnerContainer}>
                {query ? (
                  <SearchIcon className={classes.bigIcon} />
                ) : (
                  <HistoryIcon className={classes.bigIcon} />
                )}
                <Typography variant="h5" color="textSecondary">
                  {query ? getLocale('noMatchingResults') : getLocale('history')}
                </Typography>
                {!query && (
                  <Typography variant="body2" color="textSecondary">
                    {getLocale('historyDesc')}
                  </Typography>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            className={classes.listContainer}
            onScroll={onScroll}
          >
            <List disablePadding>
              {items.map((item) => [(
                <ListItem
                  button
                  key={`historyItem_${item.historyId}`}
                  onClick={() => {
                    dispatch(loadOutput(item));
                    dispatch(changeRoute(ROUTE_HOME));
                  }}
                >
                  <ListItemText
                    primary={item.outputText}
                    secondary={item.inputText}
                    primaryTypographyProps={{ color: 'textPrimary' }}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={getLocale('remove')} placement="left">
                      <IconButton
                        aria-label={getLocale('remove')}
                        onClick={() => dispatch(deleteHistoryItem(
                          item.historyId,
                          item.rev,
                        ))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ), <Divider key={`historyDivider_${item.historyId}`} />])}
            </List>
          </div>
        );
      })()}
    </div>
  );
};

export default History;
