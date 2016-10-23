/* global strings */

import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import Immutable from 'immutable';

import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import ToggleStar from 'material-ui/svg-icons/toggle/star';

import { initPhrasebook, deletePhrasebookItem, loadPhrasebook } from '../actions/phrasebook';
import { loadInfo } from '../actions/home';

class Phrasebook extends React.Component {
  componentDidMount() {
    const { onEnterPhrasebook } = this.props;

    onEnterPhrasebook();
  }

  getStyles() {
    const { card } = this.context.muiTheme;

    return {
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
      },
      container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      },
      listContainer: {
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        padding: 12,
        boxSizing: 'border-box',
      },
      paper: {
        padding: 12,
        boxSizing: 'border-box',
        display: 'flex',
        marginTop: 12,
      },
      paperLeftContainer: {
        flex: 1,
        overflow: 'hidden',
      },
      title: {
        color: card.titleColor,
        display: 'block',
        fontSize: 15,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      subtitle: {
        color: card.subtitleColor,
        display: 'block',
        fontSize: 14,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    };
  }

  render() {
    const { phrasebookItems, phrasebookLoading, onDeleteButtonTouchTap } = this.props;
    const styles = this.getStyles();


    return (
      <div style={styles.container}>
        <AppBar
          title="Phrasebook"
          showMenuIconButton={false}
        />
        {(() => {
          if (phrasebookItems.size < 1 && phrasebookLoading === false) {
            return (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyInnerContainer}>
                  <ToggleStar style={styles.bigIcon} />
                  <h3>{strings.phrasebookIsEmpty}</h3>
                </div>
              </div>
            );
          }

          return (
            <div style={styles.listContainer}>
              {phrasebookItems.map(item => (
                <Paper key={`phrasebookItem_${item.get('phrasebookId')}`} zDepth={1} style={styles.paper}>
                  <div style={styles.paperLeftContainer}>
                    <p style={styles.title}>{item.get('outputText')}</p>
                    <p style={styles.subtitle}>{item.get('inputText')}</p>
                  </div>
                  <div style={styles.paperRightContainer}>
                    <IconButton
                      tooltip={strings.removeFromPhrasebook}
                      onTouchTap={() => onDeleteButtonTouchTap(
                        item.get('phrasebookId'),
                        item.get('rev')
                      )}
                    >
                      <ToggleStar />
                    </IconButton>
                  </div>
                </Paper>
              ))}
            </div>
          );
        })()}
      </div>
    );

    /*
    return (
      <div>
        <div className="app-history-page">
          {(() => {
            if (phrasebookItems.length < 1 && phrasebookLoading === false) {
              return (
                <div className="app-empty-box">
                  <div className="app-big-icon"></div>
                  <h2 className="win-h2">{strings.phrasebookIsEmpty}</h2>
                </div>
              );
            }

            return (
              <div>
                {phrasebookItems.map((data, i) => (
                  <div
                    className="app-item"
                    key={i}
                    onTouchTap={() => onItemTouchTap()}
                  >
                    <div className="app-control-container">
                      <div className="win-h5 app-language-title">
                        English
                        <span>{' > '}</span>
                        Vietnamese
                      </div>
                      <div className="app-toolbar-container win-interactive">
                        <ReactWinJS.ToolBar>
                          <ReactWinJS.ToolBar.Button
                            key="delete"
                            icon=""
                            label={strings.removeFromPhrasebook}
                            // onTouchTap={() => onDeleteButtonTouchTap(id, rev)}
                          />
                        </ReactWinJS.ToolBar>
                      </div>
                    </div>
                  </div>
                ))}
                {canLoadMore === true && phrasebookLoading === false ? (
                  <div className="app-footer">
                    <button
                      className="win-button"
                      onTouchTap={onLoadMoreButtonTouchTap}
                    >
                      {i18n('load-more')}
                    </button>
                  </div>
                ) : null}
                {phrasebookLoading === true ? (
                  <progress className="win-progress-ring win-large app-ring" />
                ) : null}
              </div>
            );
          })()}
        </div>
      </div>
    );
    */
  }
}

Phrasebook.propTypes = {
  phrasebookItems: React.PropTypes.instanceOf(Immutable.List),
  canLoadMore: React.PropTypes.bool,
  phrasebookLoading: React.PropTypes.bool,
  onItemTouchTap: React.PropTypes.func,
  onEnterPhrasebook: React.PropTypes.func,
  onDeleteButtonTouchTap: React.PropTypes.func,
  onLoadMoreButtonTouchTap: React.PropTypes.func,
};

Phrasebook.contextTypes = {
  muiTheme: React.PropTypes.object,
};

const mapStateToProps = state => ({
  phrasebookItems: state.phrasebook.phrasebookItems,
  canLoadMore: state.phrasebook.canLoadMore,
  phrasebookLoading: state.phrasebook.phrasebookLoading,
});

const mapDispatchToProps = dispatch => ({
  onItemTouchTap: (itemData) => {
    dispatch(loadInfo(itemData));
    dispatch(replace('/'));
  },
  onDeleteButtonTouchTap: (id, rev) => {
    dispatch(deletePhrasebookItem(id, rev));
  },
  onEnterPhrasebook: () => {
    dispatch(initPhrasebook());
  },
  onLoadMoreButtonTouchTap: () => {
    dispatch(loadPhrasebook());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Phrasebook);
