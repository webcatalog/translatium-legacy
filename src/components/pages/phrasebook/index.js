/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import ToggleStarIcon from '@material-ui/icons/Star';
import SearchIcon from '@material-ui/icons/Search';

import getLocale from '../../../helpers/get-locale';

import { deletePhrasebookItem, loadPhrasebook } from '../../../state/pages/phrasebook/actions';
import { loadOutput } from '../../../state/pages/home/actions';
import { changeRoute } from '../../../state/root/router/actions';

import { ROUTE_HOME } from '../../../constants/routes';

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
}));

const Phrasebook = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const canLoadMore = useSelector((state) => state.pages.phrasebook.canLoadMore);
  const items = useSelector((state) => state.pages.phrasebook.items);
  const loading = useSelector((state) => state.pages.phrasebook.loading);
  const query = useSelector((state) => state.pages.phrasebook.query);

  useEffect(() => {
    dispatch(loadPhrasebook(true));
  }, [dispatch]);

  const onScroll = useCallback((e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight > scrollHeight - 200) {
      if (canLoadMore === true && loading === false) {
        dispatch(loadPhrasebook());
      }
    }
  }, [dispatch, canLoadMore, loading]);

  return (
    <div className={classes.container}>
      <AppBar position="static" color="default" elevation={0} classes={{ colorDefault: classes.appBarColorDefault }}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <Typography variant="subtitle1" color="inherit" className={classes.title}>{getLocale('phrasebook')}</Typography>
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
                  <ToggleStarIcon className={classes.bigIcon} />
                )}
                <Typography variant="h5" color="textSecondary">
                  {query ? getLocale('noMatchingResults') : getLocale('phrasebookIsEmpty')}
                </Typography>
                {!query && (
                  <Typography variant="body2" color="textSecondary">
                    {getLocale('phrasebookDesc')}
                  </Typography>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className={classes.listContainer} onScroll={onScroll}>
            <List disablePadding>
              {items.map((item) => [(
                <ListItem
                  button
                  key={`phrasebookItem_${item.phrasebookId}`}
                  onClick={() => {
                    dispatch(loadOutput(item));
                    dispatch(changeRoute(ROUTE_HOME));
                  }}
                >
                  <ListItemText
                    primary={item.highlighting && item.highlighting['data.outputText'] ? (
                      // eslint-disable-next-line react/no-danger
                      <span dangerouslySetInnerHTML={{ __html: item.highlighting['data.outputText'] }} />
                    ) : item.outputText}
                    secondary={item.highlighting && item.highlighting['data.inputText'] ? (
                      // eslint-disable-next-line react/no-danger
                      <span dangerouslySetInnerHTML={{ __html: item.highlighting['data.inputText'] }} />
                    ) : item.inputText}
                    primaryTypographyProps={{ color: 'textPrimary' }}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={getLocale('remove')} placement="left">
                      <IconButton
                        aria-label={getLocale('removeFromPhrasebook')}
                        onClick={() => dispatch(deletePhrasebookItem(
                          item.phrasebookId,
                          item.rev,
                        ))}
                      >
                        <ToggleStarIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ), <Divider key={`phrasebookDivider_${item.phrasebookId}`} />])}
            </List>
          </div>
        );
      })()}
    </div>
  );
};

export default Phrasebook;
