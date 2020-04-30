import PouchDB from 'pouchdb-browser';
import PouchDBQuickSearch from 'pouchdb-quick-search';

import { PHRASEBOOK_DB_NAME } from '../constants/dbs';

PouchDB.plugin(PouchDBQuickSearch);
const phrasebookDb = new PouchDB(PHRASEBOOK_DB_NAME);

export default phrasebookDb;
