import PouchDB from 'pouchdb-browser';

import { HISTORY_DB_NAME } from '../constants/dbs';

const historyDb = new PouchDB(HISTORY_DB_NAME);

export default historyDb;
