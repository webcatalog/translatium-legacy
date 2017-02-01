import Immutable from 'immutable';
import Raven from 'raven-js';

import { UPDATE_HISTORY } from '../constants/actions';
import historyDb from '../libs/historyDb';

const defaultOptions = {
  include_docs: true,
  descending: true,
  limit: 8,
};

export const loadHistory = (init, limit) => ((dispatch, getState) => {
  const { historyItems, canLoadMore } = getState().history;

  dispatch({
    type: UPDATE_HISTORY,
    historyItems,
    canLoadMore,
    historyLoading: true,
  });


  let items = (init === true) ? Immutable.fromJS([]) : historyItems;

  const options = Object.assign({}, defaultOptions);
  const l = items.size;
  if (l > 0) {
    options.startkey = items.getIn([l - 1, 'historyId']);
    options.skip = 1;
  }
  if (limit) options.limit = limit;

  historyDb.allDocs(options)
    .then((response) => {
      response.rows.forEach((row) => {
        /* eslint-disable no-underscore-dangle */
        if (row.doc.data) {
          const data = row.doc.data;
          data.historyId = row.doc._id;
          data.rev = row.doc._rev;

          items = items.push(Immutable.fromJS(data));
        }
        /* eslint-enable no-underscore-dangle */
      });

      dispatch({
        type: UPDATE_HISTORY,
        historyItems: items,
        canLoadMore: (response.total_rows > 0 && items.size < response.total_rows),
        historyLoading: false,
      });
    })
    .catch((e) => {
      Raven.captureException(e);
      dispatch({
        type: UPDATE_HISTORY,
        historyItems: items,
        canLoadMore: false,
        historyLoading: false,
      });
    });
});

export const deleteHistoryItem = (id, rev) => ((dispatch, getState) => {
  const { history } = getState();
  const { historyItems, historyLoading, canLoadMore } = history;

  let items = historyItems;

  items.every((doc, i) => {
    if (doc.get('historyId') === id) {
      items = items.delete(i);
      return false;
    }
    return true;
  });

  dispatch({
    type: UPDATE_HISTORY,
    historyItems: items,
    historyLoading,
    canLoadMore,
  });

  historyDb.remove(id, rev)
    .then(() => {
      if (canLoadMore) {
        dispatch(loadHistory(false, 1));
      }
    });
});
