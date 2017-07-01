/* global strings */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
          if (historyItems.length < 1 && historyLoading === false) {
            return null;
          }

          return (
            <div style={styles.listContainer} ref={(c) => { this.listView = c; }}>
              <List>
                {historyItems.map(item => [(
                  <ListItem
                    key={`historyItem_${item.historyId}`}
                    onTouchTap={() => onItemTouchTap(item)}
                    rightIconButton={(
                      <IconButton
                        tooltip={strings.removeFromHistory}
                        tooltipPosition="bottom-left"
                        onTouchTap={() => {
                          onDeleteButtonTouchTap(
                            item.historyId,
                            item.rev,
                          );
                        }}
                      >
                        <ActionDelete />
                      </IconButton>
                    )}
                    primaryText={item.outputText}
                    secondaryText={item.inputText}
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
  historyItems: PropTypes.arrayOf(PropTypes.object),
  canLoadMore: PropTypes.bool,
  historyLoading: PropTypes.bool,
  onItemTouchTap: PropTypes.func.isRequired,
  onEnterHistory: PropTypes.func.isRequired,
  onDeleteButtonTouchTap: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
};

History.contextTypes = {
  muiTheme: PropTypes.object,
};

const mapStateToProps = state => ({
  historyItems: state.history.items,
  canLoadMore: state.history.canLoadMore,
  historyLoading: state.history.loading,
});

const mapDispatchToProps = dispatch => ({
  onItemTouchTap: output => dispatch(loadOutput(output)),
  onDeleteButtonTouchTap: (id, rev) => dispatch(deleteHistoryItem(id, rev)),
  onEnterHistory: () => dispatch(loadHistory(true)),
  onLoadMore: () => dispatch(loadHistory()),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(History);
