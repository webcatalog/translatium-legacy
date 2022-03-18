/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import getLocale from '../../../helpers/get-locale';

import keyboardMap from '../../../constants/keyboard-map';

import {
  close as closeDialogShortcut,
  setCombinator,
} from '../../../state/pages/preferences/shortcut-dialog/actions';

import { requestSetPreference } from '../../../senders';

const useStyles = makeStyles({
  combinatorContainer: {
    marginTop: 12,
  },
  plusText: {
    paddingLeft: 12,
    paddingRight: 12,
  },
});

const renderCombinator = (combinator) => combinator
  .replace(/\+/g, ' + ')
  .replace('alt', window.process.platform !== 'darwin' ? 'alt' : '⌥')
  .replace('shift', window.process.platform !== 'darwin' ? 'shift' : '⇧')
  .replace('mod', window.process.platform !== 'darwin' ? 'ctrl' : '⌘')
  .replace('meta', '⌘')
  .toUpperCase();

const DialogShortcut = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const combinator = useSelector((state) => state.pages.preferences.shortcutDialog.combinator);
  const identifier = useSelector((state) => state.pages.preferences.shortcutDialog.identifier);
  const open = useSelector((state) => state.pages.preferences.shortcutDialog.open);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const pressed = [];

      if (e.ctrlKey) pressed.push('ctrl');
      if (e.metaKey) pressed.push('meta');
      if (e.altKey) pressed.push('alt');
      if (e.shiftKey) pressed.push('shift');

      const modifier = keyboardMap[e.keyCode];
      if (modifier && ['SHIFT', 'OS_KEY', 'CONTROL', 'ALT'].indexOf(modifier) < 0) {
        pressed.push(modifier.toLowerCase());
      }

      if (pressed.length < 2) return;

      dispatch(setCombinator(pressed.join('+')));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  return (
    <Dialog open={open} onClose={() => dispatch(closeDialogShortcut())}>
      <DialogTitle>
        {getLocale('openKeyboardShortcut')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {getLocale('typeNewKeyboardCombinator')}
        </DialogContentText>
        <DialogContentText className={classes.combinatorContainer}>
          {combinator && combinator !== '+' && combinator.split('+').map((key, i) => (
            <span key={key}>
              {i > 0 && <span className={classes.plusText}>+</span>}
              <Button variant="contained">
                {renderCombinator(key)}
              </Button>
            </span>
          ))}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(closeDialogShortcut())}>
          {getLocale('cancel')}
        </Button>
        <Button
          onClick={() => {
            requestSetPreference(`${identifier}Shortcut`, null);
            dispatch(closeDialogShortcut());
          }}
        >
          {getLocale('removeShortcut')}
        </Button>
        <Button
          color="primary"
          onClick={() => {
            requestSetPreference(`${identifier}Shortcut`, combinator);
            dispatch(closeDialogShortcut());
          }}
        >
          {getLocale('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogShortcut;
