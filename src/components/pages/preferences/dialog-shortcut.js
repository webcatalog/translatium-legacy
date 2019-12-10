import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import connectComponent from '../../../helpers/connect-component';

import {
  closeShortcutDialog,
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

      if (e.keyCode === 16) return;

      if (e.ctrlKey) pressed.push('ctrl');
      if (e.metaKey) pressed.push('meta');
      if (e.altKey) pressed.push('alt');
      if (e.shiftKey) pressed.push('shift');

      pressed.push(String.fromCharCode(e.keyCode).toLowerCase());

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
      onCloseShortcutDialog,
      open,
      locale,
    } = this.props;

    return (
      <Dialog open={open} onClose={onCloseShortcutDialog}>
        <DialogTitle>
          {' '}
          {identifier === 'openOnMenubar' && window.process.platform === 'win32' ? locale.openOnTaskbar : locale[identifier]}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {locale.typeNewKeyboardCombinator}
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
          <Button onClick={onCloseShortcutDialog}>
            {locale.cancel}
          </Button>
          <Button
            onClick={() => {
              requestSetPreference(`${identifier}Shortcut`, null);
              onCloseShortcutDialog();
            }}
          >
            {locale.removeShortcut}
          </Button>
          <Button
            color="primary"
            onClick={() => {
              requestSetPreference(`${identifier}Shortcut`, combinator);
              onCloseShortcutDialog();
            }}
          >
            {locale.save}
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
  onCloseShortcutDialog: PropTypes.func.isRequired,
  onSetCombinator: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  locale: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  combinator: state.pages.preferences.shortcutDialog.combinator,
  identifier: state.pages.preferences.shortcutDialog.identifier,
  open: state.pages.preferences.shortcutDialog.open,
  locale: state.locale,
});

const actionCreators = {
  closeShortcutDialog,
  setCombinator,
};

export default connectComponent(
  DialogShortcut,
  mapStateToProps,
  actionCreators,
  styles,
);
