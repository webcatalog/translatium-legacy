/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import PouchDB from 'pouchdb-browser';
import PouchDBQuickSearch from 'pouchdb-quick-search';

import { PHRASEBOOK_DB_NAME } from '../constants/dbs';

PouchDB.plugin(PouchDBQuickSearch);
const phrasebookDb = new PouchDB(PHRASEBOOK_DB_NAME);

export default phrasebookDb;
