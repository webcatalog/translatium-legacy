import PouchDB from 'pouchdb-browser';

const phrasebookDb = new PouchDB('favorites');

export default phrasebookDb;
