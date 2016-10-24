import Immutable from 'immutable';

import { UPDATE_PHRASEBOOK } from '../constants/actions';
import phrasebookDb from '../libs/phrasebookDb';

const options = {
  include_docs: true,
  descending: true,
  limit: 10,
};

export const loadPhrasebook = () => ((dispatch, getState) => {
  const { phrasebookItems, canLoadMore } = getState().phrasebook;

  dispatch({
    type: UPDATE_PHRASEBOOK,
    phrasebookItems,
    canLoadMore,
    phrasebookLoading: true,
  });


  let items = phrasebookItems;

  const l = items.size;
  if (l > 0) {
    options.startkey = items.get(l - 1).id;
    options.skip = 1;
  }

  phrasebookDb.allDocs(options)
    .then((response) => {
      response.rows.forEach((row) => {
        // Old data compatibility
        if (row.doc.inputObj) {
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
        } else if (row.doc.phrasebookVersion === 3) {
          const data = row.doc.data;
          /* eslint-disable no-underscore-dangle */
          data.phrasebookId = row.doc._id;
          data.rev = row.doc._rev;
          /* eslint-enable no-underscore-dangle */

          items = items.push(Immutable.fromJS(data));

        } else {
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


export const initPhrasebook = () => ((dispatch) => {
  dispatch({
    type: UPDATE_PHRASEBOOK,
    phrasebookItems: Immutable.fromJS([]),
    canLoadMore: false,
    phrasebookLoading: true,
  });

  dispatch(loadPhrasebook());
});

export const deletePhrasebookItem = (id, rev) => ((dispatch, getState) => {
  const { phrasebookItems, phrasebookLoading, canLoadMore } = getState().phrasebook;

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

  phrasebookDb.remove(id, rev)
    .then(() => {
      if (phrasebookItems.size === 0) {
        dispatch(loadPhrasebook());
      }
    });
});
