import PouchDB from 'pouchdb-browser';

import { PHRASEBOOK_DB_NAME } from '../constants/dbs';

const phrasebookDb = new PouchDB(PHRASEBOOK_DB_NAME);

export default phrasebookDb;
