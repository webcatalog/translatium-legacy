/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import {
  UPDATE_HISTORY,
  UPDATE_HISTORY_PAGE,
  UPDATE_HISTORY_PAGE_QUERY,
} from '../../../constants/actions';
import LUNR_LANGUAGES from '../../../constants/lunr-languages';
import historyDb from '../../../helpers/history-db';

import { loadHistory as loadHomeHistory } from '../home/history/actions';

const defaultOptions = {
  include_docs: true,
  descending: true,
  limit: 10,
};

export const loadHistory = (init, limit) => ((dispatch, getState) => {
  const { history } = getState().pages;
  const { query } = history;

  const items = (init === true) ? [] : [...history.items];
  const canLoadMore = init === true ? false : history.canLoadMore;

  dispatch({
    type: UPDATE_HISTORY_PAGE,
    items,
    canLoadMore,
    loading: true,
  });

  const options = { ...defaultOptions };
  const l = items.length;
  if (l > 0) {
    options.startkey = items[l - 1].historyId;
    options.skip = 1;
  }
  if (limit) options.limit = limit;

  Promise.resolve()
    .then(() => {
      if (query) {
        options.query = query;
        options.fields = ['data.inputText', 'data.outputText'];
        options.highlighting = true;
        options.highlighting_pre = '<highlight>';
        options.highlighting_post = '</highlight>';
        options.language = LUNR_LANGUAGES;
        return historyDb.search(options);
      }
      return historyDb.allDocs(options);
    })
    .then((response) => {
      response.rows.forEach((row) => {
        /* eslint-disable no-underscore-dangle */
        const newItem = row.doc.data;
        newItem.historyId = row.doc._id;
        newItem.rev = row.doc._rev;

        items.push(newItem);
        /* eslint-enable no-underscore-dangle */
      });

      // verify the result query matched the current query
      if (query !== getState().pages.history.query) return;

      dispatch({
        type: UPDATE_HISTORY_PAGE,
        items,
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
            type: UPDATE_HISTORY_PAGE,
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

      // reload history for the home page
      dispatch(loadHomeHistory(true));
    })
    .catch((e) => {
      // eslint-disable-next-line
      console.log(e);
    });
});

let timeout = null;
export const updateQuery = (query) => (dispatch) => {
  dispatch({
    type: UPDATE_HISTORY_PAGE_QUERY,
    query,
  });
  clearTimeout(timeout);
  if (query === '') {
    dispatch(loadHistory(true));
  } else {
    timeout = setTimeout(() => {
      dispatch(loadHistory(true));
    }, 300);
  }
};

export const clearAllHistory = () => (dispatch) => {
  dispatch(updateQuery(''));
  dispatch({
    type: UPDATE_HISTORY_PAGE,
    items: [],
    canLoadMore: false,
    loading: false,
  });

  // reload history for the home page
  dispatch({
    type: UPDATE_HISTORY,
    items: [],
    canLoadMore: false,
    loading: true,
  });

  historyDb.allDocs()
    .then((result) => Promise.all(
      result.rows.map((row) => historyDb.remove(row.id, row.value.rev)),
    ))
    .catch((err) => {
      // eslint-disable-next-line
      console.log(err);
    })
    .then(() => {
      // reload after done deleting to be certain
      dispatch(loadHistory(true));
      dispatch(loadHomeHistory(true));
    });
};
