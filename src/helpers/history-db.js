/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import PouchDB from 'pouchdb-browser';

import { HISTORY_DB_NAME } from '../constants/dbs';

const historyDb = new PouchDB(HISTORY_DB_NAME);

export default historyDb;
