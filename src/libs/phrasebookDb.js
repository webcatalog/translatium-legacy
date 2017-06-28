import PouchDB from 'pouchdb-browser';

import { PHRASEBOOK_DB_NAME } from '../constants/dbNames';

const phrasebookDb = new PouchDB(PHRASEBOOK_DB_NAME);

export default phrasebookDb;
