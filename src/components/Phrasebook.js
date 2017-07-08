import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { withStyles, createStyleSheet } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';
import IconButton from 'material-ui/IconButton';
import List, { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import ToggleStar from 'material-ui-icons/Star';
import Divider from 'material-ui/Divider';

import { deletePhrasebookItem, loadPhrasebook } from '../actions/phrasebook';
import { loadOutput } from '../actions/home';

const styleSheet = createStyleSheet('Phrasebook', theme => ({
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
}));

class Phrasebook extends React.Component {
  componentDidMount() {
    const { onEnterPhrasebook, onLoadMore } = this.props;

    onEnterPhrasebook();

    if (this.listView) {
      this.listView.onscroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = this.listView;
        if (scrollTop + clientHeight > scrollHeight - 200) {
          if (this.props.canLoadMore === true && this.props.phrasebookLoading === false) {
            onLoadMore();
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
      phrasebookItems,
      phrasebookLoading,
      strings,
      onDeleteButtonClick,
      onItemClick,
    } = this.props;

    return (
      <div className={classes.container}>
        <AppBar position="static">
          <Toolbar>
            <Typography type="title" color="inherit">{strings.phrasebook}</Typography>
          </Toolbar>
        </AppBar>
        {(() => {
          if (phrasebookItems.length < 1 && phrasebookLoading === false) {
            return (
              <div className={classes.emptyContainer}>
                <div className={classes.emptyInnerContainer}>
                  <ToggleStar className={classes.bigIcon} />
                  <Typography type="headline">{strings.phrasebookIsEmpty}</Typography>
                </div>
              </div>
            );
          }

          return (
            <div className={classes.listContainer} ref={(c) => { this.listView = c; }}>
              <List>
                {phrasebookItems.map(item => [(
                  <ListItem
                    key={`phrasebookItem_${item.phrasebookId}`}
                    onClick={() => onItemClick(item)}
                  >
                    <ListItemText
                      primary={item.outputText}
                      secondary={item.inputText}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        aria-label={strings.removeFromPhrasebook}
                        onClick={() => {
                          onDeleteButtonClick(
                            item.phrasebookId,
                            item.rev,
                          );
                        }}
                      >
                        <ToggleStar />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ), <Divider inset={false} />])}
              </List>
              {phrasebookLoading && (
                <LinearProgress mode="indeterminate" className={classes.progress} />
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
  onDeleteButtonClick: PropTypes.func.isRequired,
  onEnterPhrasebook: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  phrasebookItems: PropTypes.arrayOf(PropTypes.object),
  phrasebookLoading: PropTypes.bool,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  phrasebookItems: state.phrasebook.items,
  canLoadMore: state.phrasebook.canLoadMore,
  phrasebookLoading: state.phrasebook.loading,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onItemClick: (output) => {
    dispatch(loadOutput(output));
    dispatch(replace('/'));
  },
  onDeleteButtonClick: (id, rev) => dispatch(deletePhrasebookItem(id, rev)),
  onEnterPhrasebook: () => dispatch(loadPhrasebook(true)),
  onLoadMore: () => dispatch(loadPhrasebook()),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(withStyles(styleSheet)(Phrasebook));
