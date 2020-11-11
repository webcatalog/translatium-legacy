/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { UPDATE_OCR } from '../../../constants/actions';

const initialState = null;

const ocr = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_OCR:
      return action.ocr;
    default:
      return state;
  }
};

export default ocr;
