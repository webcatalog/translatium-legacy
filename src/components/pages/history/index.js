import React from 'react';
import PropTypes from 'prop-types';

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

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { deleteHistoryItem, loadHistory, clearAllHistory } from '../../../state/pages/history/actions';
import { loadOutput } from '../../../state/pages/home/actions';
import { changeRoute } from '../../../state/root/router/actions';

import { ROUTE_HOME } from '../../../constants/routes';

import SearchBox from './search-box';

const styles = (theme) => ({
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
    // eslint-disable-next-line no-nested-ternary
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : (window.process.platform === 'darwin' ? theme.palette.primary.main : null),
    // eslint-disable-next-line no-nested-ternary
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : (window.process.platform === 'darwin' ? theme.palette.primary.contrastText : null),
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
});

class History extends React.Component {
  componentDidMount() {
    const { onLoadHistory } = this.props;

    onLoadHistory(true);

    if (this.listView) {
      this.listView.onscroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = this.listView;
        if (scrollTop + clientHeight > scrollHeight - 200) {
          const { canLoadMore, historyLoading } = this.props;
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
      onChangeRoute,
      onClearAllHistory,
      onDeleteHistoryItem,
      onLoadOutput,
      query,
    } = this.props;

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
                  onClick={onClearAllHistory}
                >
                  <ClearAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
        </AppBar>
        <SearchBox />
        {(() => {
          if (historyItems.length < 1 && historyLoading === false) {
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
            <div className={classes.listContainer} ref={(c) => { this.listView = c; }}>
              <List disablePadding>
                {historyItems.map((item) => [(
                  <ListItem
                    button
                    key={`historyItem_${item.historyId}`}
                    onClick={() => {
                      onLoadOutput(item);
                      onChangeRoute(ROUTE_HOME);
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
                          onClick={() => onDeleteHistoryItem(
                            item.historyId,
                            item.rev,
                          )}
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
  }
}

History.propTypes = {
  canLoadMore: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  historyItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  historyLoading: PropTypes.bool.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  onClearAllHistory: PropTypes.func.isRequired,
  onDeleteHistoryItem: PropTypes.func.isRequired,
  onLoadHistory: PropTypes.func.isRequired,
  onLoadOutput: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  canLoadMore: state.pages.history.canLoadMore,
  historyItems: state.pages.history.items,
  historyLoading: state.pages.history.loading,
  query: state.pages.history.query,
});

const actionCreators = {
  changeRoute,
  clearAllHistory,
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
