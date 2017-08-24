import { UPDATE_HISTORY } from '../../../../constants/actions';
import historyDb from '../../../../helpers/history-db';

const defaultOptions = {
  include_docs: true,
  descending: true,
  limit: 10,
};

export const loadHistory = (init, limit) => ((dispatch, getState) => {
  const { items, canLoadMore } = getState().pages.home.history;

  // only init once.
  if (init === true && items.length > 0) return;

  dispatch({
    type: UPDATE_HISTORY,
    items,
    canLoadMore,
    loading: true,
  });


  const options = Object.assign({}, defaultOptions);
  const l = items.length;
  if (l > 0) {
    options.startkey = items[l - 1].historyId;
    options.skip = 1;
  }
  if (limit) options.limit = limit;

  historyDb.allDocs(options)
    .then((response) => {
      let newItems = items;

      response.rows.forEach((row) => {
        /* eslint-disable no-underscore-dangle */
        const newItem = row.doc.data;
        newItem.historyId = row.doc._id;
        newItem.rev = row.doc._rev;

        newItems = [...newItems, newItem];
        /* eslint-enable no-underscore-dangle */
      });

      dispatch({
        type: UPDATE_HISTORY,
        items: newItems,
        canLoadMore: (response.total_rows > 0 && items.length < response.total_rows),
        loading: false,
      });
    })
    .catch((e) => {
      // eslint-disable-next-line
      console.log(e);
    });
});

export const deleteHistoryItem = (id, rev) => ((dispatch, getState) => {
  const { history } = getState().pages;
  const { items, loading, canLoadMore } = history;

  historyDb.remove(id, rev)
    .then(() => {
      items.every((doc, i) => {
        if (doc.historyId === id) {
          dispatch({
            type: UPDATE_HISTORY,
            items: items.filter((_, _i) => _i !== i),
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
  const { history } = getState().pages;
  const { items, loading, canLoadMore } = history;

  const newHistoryId = new Date().toJSON();
  historyDb.put({
    _id: newHistoryId,
    data,
    phrasebookVersion: 3,
  })
    .then(({ id, rev }) => {
      const newItem = data;
      newItem.historyId = id;
      newItem.rev = rev;

      dispatch({
        type: UPDATE_HISTORY,
        items: [newItem, ...items],
        loading,
        canLoadMore,
      });
    })
    .catch((e) => {
      // eslint-disable-next-line
      console.log(e);
    });
};
