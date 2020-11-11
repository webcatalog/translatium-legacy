/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import {
  DIALOG_SHORTCUT_CLOSE,
  DIALOG_SHORTCUT_OPEN,
  DIALOG_SHORTCUT_SET_COMBINATOR,
} from '../../../../constants/actions';

export const close = () => ({
  type: DIALOG_SHORTCUT_CLOSE,
});

export const open = (identifier, combinator) => ({
  type: DIALOG_SHORTCUT_OPEN,
  identifier,
  combinator,
});

export const setCombinator = (combinator) => ({
  type: DIALOG_SHORTCUT_SET_COMBINATOR,
  combinator,
});
