/* global strings */

import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import LinearProgress from 'material-ui/LinearProgress';
import IconButton from 'material-ui/IconButton';
import { List, ListItem } from 'material-ui/List';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';

import { deleteHistoryItem, loadHistory } from '../actions/history';
import { loadOutput } from '../actions/home';


class History extends React.Component {
  componentDidMount() {
    const { onEnterHistory, onLoadMore } = this.props;

    onEnterHistory();

    if (this.listView) {
      this.listView.onscroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = this.listView;
        if (scrollTop + clientHeight > scrollHeight - 200) {
          if (this.props.canLoadMore === true && this.props.historyLoading === false) {
            onLoadMore();
          }
        }
      };
    }
  }

  componentWillUnmount() {
    if (this.listView) this.listView.onscroll = null;
  }

  getStyles() {
    const {
      palette: {
        textColor,
      },
    } = this.context.muiTheme;

    return {
      emptyContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      emptyInnerContainer: {
        textAlign: 'center',
        color: textColor,
      },
      bigIcon: {
        height: 96,
        width: 96,
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
    };
  }

  render() {
    const {
      historyItems, historyLoading,
      onDeleteButtonTouchTap, onItemTouchTap,
    } = this.props;
    const styles = this.getStyles();

    return (
      <div style={styles.container}>
        {(() => {
          if (historyItems.size < 1 && historyLoading === false) {
            return null;
          }

          return (
            <div style={styles.listContainer} ref={(c) => { this.listView = c; }}>
              <List>
                {historyItems.map(item => [(
                  <ListItem
                    key={`historyItem_${item.get('historyId')}`}
                    onTouchTap={() => onItemTouchTap(item)}
                    rightIconButton={(
                      <IconButton
                        tooltip={strings.removeFromHistory}
                        tooltipPosition="bottom-left"
                        onTouchTap={(ev) => {
                          let e = ev;
                          /* global window */
                          if (!e) e = window.event;
                          e.cancelBubble = true;
                          if (e.stopPropagation) e.stopPropagation();

                          onDeleteButtonTouchTap(
                            item.get('historyId'),
                            item.get('rev'),
                          );
                        }}
                      >
                        <ActionDelete />
                      </IconButton>
                    )}
                    primaryText={item.get('outputText')}
                    secondaryText={item.get('inputText')}
                  />
                ), <Divider inset={false} />])}
              </List>
              {historyLoading === true ? (
                <LinearProgress mode="indeterminate" style={styles.progress} />
              ) : null}
            </div>
          );
        })()}
      </div>
    );
  }
}

History.propTypes = {
  historyItems: React.PropTypes.instanceOf(Immutable.List),
  canLoadMore: React.PropTypes.bool,
  historyLoading: React.PropTypes.bool,
  onItemTouchTap: React.PropTypes.func,
  onEnterHistory: React.PropTypes.func,
  onDeleteButtonTouchTap: React.PropTypes.func,
  onLoadMore: React.PropTypes.func,
};

History.contextTypes = {
  muiTheme: React.PropTypes.object,
};

const mapStateToProps = state => ({
  historyItems: state.history.historyItems,
  canLoadMore: state.history.canLoadMore,
  historyLoading: state.history.historyLoading,
});

const mapDispatchToProps = dispatch => ({
  onItemTouchTap: (output) => {
    dispatch(loadOutput(output));
  },
  onDeleteButtonTouchTap: (id, rev) => {
    dispatch(deleteHistoryItem(id, rev));
  },
  onEnterHistory: () => {
    dispatch(loadHistory(true));
  },
  onLoadMore: () => {
    dispatch(loadHistory());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(History);
