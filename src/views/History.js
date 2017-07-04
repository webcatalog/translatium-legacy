import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { LinearProgress } from 'material-ui/Progress';
import IconButton from 'material-ui/IconButton';
import List, { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import ActionDelete from 'material-ui-icons/Delete';
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
    return {
      emptyContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      emptyInnerContainer: {
        textAlign: 'center',
        // color: textColor,
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
      historyItems,
      historyLoading,
      strings,
      onDeleteButtonClick,
      onItemClick,
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
                    onClick={() => onItemClick(item)}
                  >
                    <ListItemText
                      primary={item.outputText}
                      secondary={item.inputText}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        tooltip={strings.removeFromHistory}
                        tooltipPosition="bottom-left"
                        onClick={() => {
                          onDeleteButtonClick(
                            item.historyId,
                            item.rev,
                          );
                        }}
                      >
                        <ActionDelete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
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
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onItemClick: PropTypes.func.isRequired,
  onEnterHistory: PropTypes.func.isRequired,
  onDeleteButtonClick: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  historyItems: state.history.items,
  canLoadMore: state.history.canLoadMore,
  historyLoading: state.history.loading,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onItemClick: output => dispatch(loadOutput(output)),
  onDeleteButtonClick: (id, rev) => dispatch(deleteHistoryItem(id, rev)),
  onEnterHistory: () => dispatch(loadHistory(true)),
  onLoadMore: () => dispatch(loadHistory()),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(History);
