/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

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

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { deletePhrasebookItem, loadPhrasebook } from '../../../state/pages/phrasebook/actions';
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
});

class Phrasebook extends React.Component {
  componentDidMount() {
    const { onLoadPhrasebook } = this.props;

    onLoadPhrasebook(true);

    if (this.listView) {
      this.listView.onscroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = this.listView;
        if (scrollTop + clientHeight > scrollHeight - 200) {
          const { canLoadMore, phrasebookLoading } = this.props;
          if (canLoadMore === true && phrasebookLoading === false) {
            onLoadPhrasebook();
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
      onChangeRoute,
      onDeletePhrasebookItem,
      onLoadOutput,
      phrasebookItems,
      phrasebookLoading,
      query,
    } = this.props;

    return (
      <div className={classes.container}>
        <AppBar position="static" color="default" elevation={0} classes={{ colorDefault: classes.appBarColorDefault }}>
          <Toolbar variant="dense" className={classes.toolbar}>
            <Typography variant="subtitle1" color="inherit" className={classes.title}>{getLocale('phrasebook')}</Typography>
          </Toolbar>
        </AppBar>
        <SearchBox />
        {(() => {
          if (phrasebookItems.length < 1 && phrasebookLoading === false) {
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
            <div className={classes.listContainer} ref={(c) => { this.listView = c; }}>
              <List disablePadding>
                {phrasebookItems.map((item) => [(
                  <ListItem
                    button
                    key={`phrasebookItem_${item.phrasebookId}`}
                    onClick={() => {
                      onLoadOutput(item);
                      onChangeRoute(ROUTE_HOME);
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
                          onClick={() => onDeletePhrasebookItem(
                            item.phrasebookId,
                            item.rev,
                          )}
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
  }
}

Phrasebook.propTypes = {
  canLoadMore: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  onDeletePhrasebookItem: PropTypes.func.isRequired,
  onLoadOutput: PropTypes.func.isRequired,
  onLoadPhrasebook: PropTypes.func.isRequired,
  phrasebookItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  phrasebookLoading: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  canLoadMore: state.pages.phrasebook.canLoadMore,
  phrasebookItems: state.pages.phrasebook.items,
  phrasebookLoading: state.pages.phrasebook.loading,
  query: state.pages.phrasebook.query,
});

const actionCreators = {
  changeRoute,
  deletePhrasebookItem,
  loadOutput,
  loadPhrasebook,
};

export default connectComponent(
  Phrasebook,
  mapStateToProps,
  actionCreators,
  styles,
);
