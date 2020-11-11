/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import DeleteIcon from '@material-ui/icons/Delete';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { deleteHistoryItem, loadHistory } from '../../../state/pages/home/history/actions';
import { loadOutput } from '../../../state/pages/home/actions';

const styles = (theme) => ({
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
});

class History extends React.Component {
  componentDidMount() {
    const { onLoadHistory } = this.props;

    onLoadHistory(true);

    if (this.listView) {
      this.listView.onscroll = () => {
        const { canLoadMore, historyLoading } = this.props;

        const { scrollTop, clientHeight, scrollHeight } = this.listView;

        if (scrollTop + clientHeight > scrollHeight - 200) {
          if (canLoadMore === true && historyLoading === false) {
            onLoadHistory();
          }
        }
      };
    }
  }

  componentWillUnmount() {
    if (this.listView) this.listView.onscroll = null;
  }

  render() {
    const {
      classes,
      historyItems,
      historyLoading,
      onDeleteHistoryItem,
      onLoadOutput,
    } = this.props;

    return (
      <div className={classes.container}>
        {(() => {
          if (historyItems.length < 1 && historyLoading === false) {
            return null;
          }

          return (
            <div className={classes.listContainer} ref={(c) => { this.listView = c; }}>
              <List disablePadding>
                {historyItems.map((item) => [(
                  <ListItem
                    button
                    key={`historyItem_${item.historyId}`}
                    onClick={() => onLoadOutput(item)}
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
                          onClick={() => {
                            onDeleteHistoryItem(
                              item.historyId,
                              item.rev,
                            );
                          }}
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
  }
}

History.propTypes = {
  canLoadMore: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  historyItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  historyLoading: PropTypes.bool.isRequired,
  onDeleteHistoryItem: PropTypes.func.isRequired,
  onLoadHistory: PropTypes.func.isRequired,
  onLoadOutput: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  historyItems: state.pages.home.history.items,
  canLoadMore: state.pages.home.history.canLoadMore,
  historyLoading: state.pages.home.history.loading,
});

const actionCreators = {
  deleteHistoryItem,
  loadHistory,
  loadOutput,
};

export default connectComponent(
  History,
  mapStateToProps,
  actionCreators,
  styles,
);
