import PouchDB from 'pouchdb';

const phrasebookDb = new PouchDB('favorites');

export default phrasebookDb;
