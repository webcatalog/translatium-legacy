import Immutable from 'immutable';

import { UPDATE_PHRASEBOOK, UPDATE_OUTPUT } from '../constants/actions';
import phrasebookDb from '../libs/phrasebookDb';

const defaultOptions = {
  include_docs: true,
  descending: true,
  limit: 10,
};

export const loadPhrasebook = (init, limit) => ((dispatch, getState) => {
  const { phrasebookItems, canLoadMore } = getState().phrasebook;

  dispatch({
    type: UPDATE_PHRASEBOOK,
    phrasebookItems,
    canLoadMore,
    phrasebookLoading: true,
  });


  let items = (init === true) ? Immutable.fromJS([]) : phrasebookItems;

  const options = Object.assign({}, defaultOptions);
  const l = items.size;
  if (l > 0) {
    options.startkey = items.getIn([l - 1, 'phrasebookId']);
    options.skip = 1;
  }
  if (limit) options.limit = limit;

  phrasebookDb.allDocs(options)
    .then((response) => {
      console.log(response.rows);
      response.rows.forEach((row) => {
        // Old data compatibility
        if (row.doc.inputObj) { // Version 1
          const { inputLang, outputLang, inputText } = row.doc.inputObj;
          const { outputText } = row.doc.outputObj;
          const { _id, _rev } = row.doc;

          items = items.push(Immutable.fromJS({
            phrasebookId: _id,
            rev: _rev,
            inputLang,
            outputLang,
            inputText,
            outputText,
          }));
        } else if (row.doc.phrasebookVersion === 3) { // Latest
          const data = row.doc.data;
          /* eslint-disable no-underscore-dangle */
          data.phrasebookId = row.doc._id;
          data.rev = row.doc._rev;
          /* eslint-enable no-underscore-dangle */

          items = items.push(Immutable.fromJS(data));
        } else { // Version 2
          const {
            _id, _rev,
            inputLang, outputLang,
            inputText, outputText,
            inputDict, outputDict,
          } = row.doc;

          items = items.push(Immutable.fromJS({
            phrasebookId: _id,
            rev: _rev,
            inputLang,
            outputLang,
            inputText,
            outputText,
            inputDict,
            outputDict,
          }));
        }
      });

      dispatch({
        type: UPDATE_PHRASEBOOK,
        phrasebookItems: items,
        canLoadMore: (response.total_rows > 0 && items.size < response.total_rows),
        phrasebookLoading: false,
      });
    });
});

export const deletePhrasebookItem = (id, rev) => ((dispatch, getState) => {
  const { home, phrasebook } = getState();
  const { phrasebookItems, phrasebookLoading, canLoadMore } = phrasebook;
  const { output } = home;

  let items = phrasebookItems;

  items.every((doc, i) => {
    if (doc.get('phrasebookId') === id) {
      items = items.delete(i);
      return false;
    }
    return true;
  });

  dispatch({
    type: UPDATE_PHRASEBOOK,
    phrasebookItems: items,
    phrasebookLoading,
    canLoadMore,
  });

  // Update toggle star status of output
  if (output && id === output.get('phrasebookId')) {
    dispatch({
      type: UPDATE_OUTPUT,
      output: output.delete('phrasebookId'),
    });
  }

  phrasebookDb.remove(id, rev)
    .then(() => {
      if (canLoadMore) {
        dispatch(loadPhrasebook(false, 1));
      }
    });
});
