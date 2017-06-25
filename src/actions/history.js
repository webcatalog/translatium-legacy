import Immutable from 'immutable';

import { UPDATE_HISTORY } from '../constants/actions';
import historyDb from '../libs/historyDb';

const defaultOptions = {
  include_docs: true,
  descending: true,
  limit: 10,
};

export const loadHistory = (init, limit) => ((dispatch, getState) => {
  const { items, canLoadMore } = getState().history;

  // only init once.
  if (init === true && items.size > 0) return;

  dispatch({
    type: UPDATE_HISTORY,
    items,
    canLoadMore,
    loading: true,
  });


  const options = Object.assign({}, defaultOptions);
  const l = items.size;
  if (l > 0) {
    options.startkey = items.getIn([l - 1, 'historyId']);
    options.skip = 1;
  }
  if (limit) options.limit = limit;

  historyDb.allDocs(options)
    .then((response) => {
      const newItems = items.withMutations((list) => {
        response.rows.forEach((row) => {
          /* eslint-disable no-underscore-dangle */
          const data = row.doc.data;
          data.historyId = row.doc._id;
          data.rev = row.doc._rev;

          list.push(Immutable.fromJS(data));
          /* eslint-enable no-underscore-dangle */
        });
      });

      dispatch({
        type: UPDATE_HISTORY,
        items: newItems,
        canLoadMore: (response.total_rows > 0 && items.size < response.total_rows),
        loading: false,
      });
    })
    .catch((e) => {
      // eslint-disable-next-line
      console.log(e);
    });
});

export const deleteHistoryItem = (id, rev) => ((dispatch, getState) => {
  const { history } = getState();
  const { items, loading, canLoadMore } = history;

  historyDb.remove(id, rev)
    .then(() => {
      items.every((doc, i) => {
        if (doc.get('historyId') === id) {
          dispatch({
            type: UPDATE_HISTORY,
            items: items.delete(i),
            loading,
            canLoadMore,
          });

          return false;
        }
        return true;
      });

      if (canLoadMore) {
        dispatch(loadHistory(false, 1));
      }
    })
    .catch((e) => {
      // eslint-disable-next-line
      console.log(e);
    });
});

export const addHistoryItem = data => (dispatch, getState) => {
  const { history } = getState();
  const { items, loading, canLoadMore } = history;

  const newHistoryId = new Date().toJSON();
  historyDb.put({
    _id: newHistoryId,
    data,
    phrasebookVersion: 3,
  })
  .then(({ id, rev }) => {
    const newData = data;
    newData.historyId = id;
    newData.rev = rev;

    dispatch({
      type: UPDATE_HISTORY,
      items: items.unshift(Immutable.fromJS(newData)),
      loading,
      canLoadMore,
    });
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.log(e);
  });
};
