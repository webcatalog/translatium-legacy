import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import Animation from './Animation';

import i18n from '../i18n';

import { initPhrasebook, deletePhrasebookItem, loadPhrasebook } from '../actions/phrasebook';
import { loadInfo } from '../actions/home';

class Phrasebook extends React.Component {
  componentDidMount() {
    const { onEnterPhrasebook } = this.props;

    onEnterPhrasebook();
  }

  render() {
    const {
      phrasebookItems, phrasebookLoading, canLoadMore,
      onItemClick,
      onDeleteButtonClick, onLoadMoreButtonClick,
    } = this.props;

    return (
      <Animation name="enterPage">
        <div className="app-history-page">
          {(() => {
            if (phrasebookItems.length < 1 && phrasebookLoading === false) {
              return (
                <div className="app-empty-box">
                  <div className="app-big-icon"></div>
                  <h2 className="win-h2">{i18n('phrasebook-is-empty')}</h2>
                </div>
              );
            }

            return (
              <div>
                {phrasebookItems.map(({
                  id, rev,
                  inputLang, outputLang,
                  inputText, outputText,
                  inputDict, outputDict,
                }, i) => (
                  <div
                    className="app-item"
                    key={i}
                    onClick={() => onItemClick({
                      inputLang, outputLang,
                      inputText, outputText,
                      inputDict, outputDict,
                    })}
                  >
                    <div className="app-control-container">
                      <div className="win-h5 app-language-title">
                        {i18n(`/languages/${inputLang}`)}
                        <span> > </span>
                        {i18n(`/languages/${outputLang}`)}
                      </div>
                      <div className="app-toolbar-container win-interactive">
                        <ReactWinJS.ToolBar>
                          <ReactWinJS.ToolBar.Button
                            key="delete"
                            icon=""
                            label={i18n('remove-from-phrasebook')}
                            onClick={() => onDeleteButtonClick(id, rev)}
                          />
                        </ReactWinJS.ToolBar>
                      </div>
                    </div>
                    <h4 className="win-h4 app-input-text">
                     {outputText}
                    </h4>
                    <h6 className="win-h6 app-input-text">
                     {inputText}
                    </h6>
                  </div>
                ))}
                {canLoadMore === true && phrasebookLoading === false ? (
                  <div className="app-footer">
                    <button
                      className="win-button"
                      onClick={onLoadMoreButtonClick}
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
      </Animation>
    );
  }
}

Phrasebook.propTypes = {
  phrasebookItems: React.PropTypes.array.isRequired,
  canLoadMore: React.PropTypes.bool.isRequired,
  phrasebookLoading: React.PropTypes.bool.isRequired,
  onItemClick: React.PropTypes.func.isRequired,
  onEnterPhrasebook: React.PropTypes.func.isRequired,
  onDeleteButtonClick: React.PropTypes.func.isRequired,
  onLoadMoreButtonClick: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  phrasebookItems: state.phrasebook.phrasebookItems,
  canLoadMore: state.phrasebook.canLoadMore,
  phrasebookLoading: state.phrasebook.phrasebookLoading,
});

const mapDispatchToProps = (dispatch) => ({
  onItemClick: ({
    inputLang, outputLang,
    inputText, outputText,
    inputDict, outputDict,
  }) => {
    dispatch(loadInfo({
      inputLang, outputLang,
      inputText, outputText,
      inputDict, outputDict,
    }));
    dispatch(replace('/'));
  },
  onDeleteButtonClick: (id, rev) => {
    dispatch(deletePhrasebookItem(id, rev));
  },
  onEnterPhrasebook: () => {
    dispatch(initPhrasebook());
  },
  onLoadMoreButtonClick: () => {
    dispatch(loadPhrasebook());
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Phrasebook);
