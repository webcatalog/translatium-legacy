import PouchDB from 'pouchdb';

import { UPDATE_PHRASEBOOK } from '../constants/actions';

const phrasebookDb = new PouchDB('favorites');
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


  const l = phrasebookItems.length;
  if (l > 0) {
    options.startkey = phrasebookItems[l - 1].id;
    options.skip = 1;
  }

  phrasebookDb.allDocs(options)
    .then(response => {
      response.rows.forEach(row => {
        // Old data compatibility
        if (row.doc.inputObj) {
          const { inputLang, outputLang, inputText } = row.doc.inputObj;
          const { outputText } = row.doc.outputObj;
          const { _id, _rev } = row.doc;

          phrasebookItems.push({
            id: _id, rev: _rev,
            inputLang, outputLang,
            inputText, outputText,
          });
        } else {
          const {
            _id, _rev,
            inputLang, outputLang,
            inputText, outputText,
            inputDict, outputDict,
          } = row.doc;

          phrasebookItems.push({
            id: _id, rev: _rev,
            inputLang, outputLang,
            inputText, outputText,
            inputDict, outputDict,
          });
        }
      });
      dispatch({
        type: UPDATE_PHRASEBOOK,
        phrasebookItems: [...phrasebookItems],
        canLoadMore: (response.total_rows > 0 && phrasebookItems.length < response.total_rows),
        phrasebookLoading: false,
      });
    });
});


export const initPhrasebook = () => ((dispatch) => {
  dispatch({
    type: UPDATE_PHRASEBOOK,
    phrasebookItems: [],
    canLoadMore: false,
    phrasebookLoading: true,
  });

  dispatch(loadPhrasebook());
});

export const deletePhrasebookItem = (id, rev) => ((dispatch, getState) => {
  const { phrasebookItems, phrasebookLoading, canLoadMore } = getState().phrasebook;

  phrasebookItems.every((doc, i) => {
    if (doc.id === id) {
      phrasebookItems.splice(i, 1);
      return false;
    }
    return true;
  });

  dispatch({
    type: UPDATE_PHRASEBOOK,
    phrasebookItems: [...phrasebookItems],
    phrasebookLoading, canLoadMore,
  });

  phrasebookDb.remove(id, rev)
    .then(() => {
      if (phrasebookItems.length === 0) {
        dispatch(loadPhrasebook());
      }
    });
});
