/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import DeleteIcon from '@material-ui/icons/Delete';

import getLocale from '../../../helpers/get-locale';

import { deleteHistoryItem, loadHistory } from '../../../state/pages/home/history/actions';
import { loadOutput } from '../../../state/pages/home/actions';

const useStyles = makeStyles((theme) => ({
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
    color: theme.palette.text.primary,
  },
  progress: {
    marginTop: 12,
  },
  textEllipsis: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const History = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const canLoadMore = useSelector((state) => state.pages.history.canLoadMore);
  const items = useSelector((state) => state.pages.history.items);
  const loading = useSelector((state) => state.pages.history.loading);

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
      {(() => {
        if (items.length < 1 && loading === false) {
          return null;
        }

        return (
          <div className={classes.listContainer} onScroll={onScroll}>
            <List disablePadding>
              {items.map((item) => [(
                <ListItem
                  button
                  key={`historyItem_${item.historyId}`}
                  onClick={() => dispatch(loadOutput(item))}
                >
                  <ListItemText
                    primary={item.outputText}
                    secondary={item.inputText}
                    classes={{
                      primary: classes.textEllipsis,
                      secondary: classes.textEllipsis,
                    }}
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
              ), <Divider key="divider" />])}
            </List>
          </div>
        );
      })()}
    </div>
  );
};

export default History;
