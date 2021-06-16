/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import keyboardMap from '../../../constants/keyboard-map';

import {
  close as closeDialogShortcut,
  setCombinator,
} from '../../../state/pages/preferences/shortcut-dialog/actions';

import { requestSetPreference } from '../../../senders';

const styles = {
  combinatorContainer: {
    marginTop: 12,
  },
  plusText: {
    paddingLeft: 12,
    paddingRight: 12,
  },
};

const renderCombinator = (combinator) => combinator
  .replace(/\+/g, ' + ')
  .replace('alt', window.process.platform !== 'darwin' ? 'alt' : '⌥')
  .replace('shift', window.process.platform !== 'darwin' ? 'shift' : '⇧')
  .replace('mod', window.process.platform !== 'darwin' ? 'ctrl' : '⌘')
  .replace('meta', '⌘')
  .toUpperCase();

class DialogShortcut extends React.Component {
  componentDidMount() {
    const { onSetCombinator } = this.props;

    window.onkeydown = (e) => {
      const pressed = [];

      if (e.ctrlKey) pressed.push('ctrl');
      if (e.metaKey) pressed.push('meta');
      if (e.altKey) pressed.push('alt');
      if (e.shiftKey) pressed.push('shift');

      const modifier = keyboardMap[e.keyCode];
      if (modifier) {
        pressed.push(modifier);
      }

      if (pressed.length < 2) return;

      onSetCombinator(pressed.join('+'));
    };
  }

  componentWillUnmount() {
    window.onkeydown = null;
  }

  render() {
    const {
      classes,
      combinator,
      identifier,
      onCloseDialogShortcut,
      open,
    } = this.props;

    return (
      <Dialog open={open} onClose={onCloseDialogShortcut}>
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
          <Button onClick={onCloseDialogShortcut}>
            {getLocale('cancel')}
          </Button>
          <Button
            onClick={() => {
              requestSetPreference(`${identifier}Shortcut`, null);
              onCloseDialogShortcut();
            }}
          >
            {getLocale('removeShortcut')}
          </Button>
          <Button
            color="primary"
            onClick={() => {
              requestSetPreference(`${identifier}Shortcut`, combinator);
              onCloseDialogShortcut();
            }}
          >
            {getLocale('save')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DialogShortcut.defaultProps = {
  identifier: null,
  combinator: null,
};

DialogShortcut.propTypes = {
  classes: PropTypes.object.isRequired,
  combinator: PropTypes.string,
  identifier: PropTypes.string,
  onCloseDialogShortcut: PropTypes.func.isRequired,
  onSetCombinator: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  combinator: state.pages.preferences.shortcutDialog.combinator,
  identifier: state.pages.preferences.shortcutDialog.identifier,
  open: state.pages.preferences.shortcutDialog.open,
});

const actionCreators = {
  closeDialogShortcut,
  setCombinator,
};

export default connectComponent(
  DialogShortcut,
  mapStateToProps,
  actionCreators,
  styles,
);
