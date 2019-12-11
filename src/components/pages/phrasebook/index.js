import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ToggleStar from '@material-ui/icons/Star';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { deletePhrasebookItem, loadPhrasebook } from '../../../state/pages/phrasebook/actions';
import { loadOutput } from '../../../state/pages/home/actions';
import { changeRoute } from '../../../state/root/router/actions';

import { ROUTE_HOME } from '../../../constants/routes';


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
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
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
    } = this.props;

    return (
      <div className={classes.container}>
        <AppBar position="static" color="default" classes={{ colorDefault: classes.appBarColorDefault }}>
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit">{getLocale('phrasebook')}</Typography>
          </Toolbar>
        </AppBar>
        {(() => {
          if (phrasebookItems.length < 1 && phrasebookLoading === false) {
            return (
              <div className={classes.emptyContainer}>
                <div className={classes.emptyInnerContainer}>
                  <ToggleStar className={classes.bigIcon} />
                  <Typography variant="h5">{getLocale('phrasebookIsEmpty')}</Typography>
                </div>
              </div>
            );
          }

          return (
            <div className={classes.listContainer} ref={(c) => { this.listView = c; }}>
              <List>
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
                      primary={item.outputText}
                      secondary={item.inputText}
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
                          <ToggleStar />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ), <Divider inset={false} key={`phrasebookDivider_${item.phrasebookId}`} />])}
              </List>
              {phrasebookLoading && (
                <LinearProgress variant="indeterminate" className={classes.progress} />
              )}
            </div>
          );
        })()}
      </div>
    );
  }
}

Phrasebook.propTypes = {
  canLoadMore: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  onDeletePhrasebookItem: PropTypes.func.isRequired,
  onLoadOutput: PropTypes.func.isRequired,
  onLoadPhrasebook: PropTypes.func.isRequired,
  phrasebookItems: PropTypes.arrayOf(PropTypes.object),
  phrasebookLoading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  phrasebookItems: state.pages.phrasebook.items,
  canLoadMore: state.pages.phrasebook.canLoadMore,
  phrasebookLoading: state.pages.phrasebook.loading,
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
