import React from 'react';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

import connectComponent from '../../helpers/connect-component';

import getPlatform from '../../helpers/get-platform';

import {
  closeShortcutDialog,
  setCombinator,
} from '../../state/pages/settings/shortcut-dialog/actions';
import {
  updateSetting,
} from '../../state/root/settings/actions';
import {
  defaultState as defaultSettings,
} from '../../state/root/settings/reducers';

const styles = {
  combinatorContainer: {
    marginTop: 12,
  },
  plusText: {
    paddingLeft: 12,
    paddingRight: 12,
  },
};

const renderCombinator = combinator =>
  combinator
    .replace(/\+/g, ' + ')
    .replace('alt', getPlatform() === 'windows' ? 'Alt' : '⌥')
    .replace('shift', getPlatform() === 'windows' ? 'Shift' : '⇧')
    .replace('mod', getPlatform() === 'windows' ? 'Ctrl' : '⌘')
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
      onSetCombinator,
      onUpdateSettings,
      open,
      strings,
    } = this.props;

    return (
      <Dialog open={open} onRequestClose={onCloseShortcutDialog}>
        <DialogTitle>{strings.shortcuts}: {strings[identifier]}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Type the new keyboard combinator.
          </DialogContentText>
          <DialogContentText className={classes.combinatorContainer}>
            {combinator && combinator !== '+' && combinator.split('+').map((key, i) => (
              <span key={key}>
                {i > 0 && <span className={classes.plusText}>+</span>}
                <Button raised>
                  {renderCombinator(key)}
                </Button>
              </span>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseShortcutDialog}>
            {strings.cancel}
          </Button>
          <Button
            color="accent"
            onClick={() => {
              onUpdateSettings(`${identifier}Shortcut`, defaultSettings[`${identifier}Shortcut`]);
              onSetCombinator(defaultSettings[`${identifier}Shortcut`]);
            }}
          >
            {strings.resetToDefault}
          </Button>
          <Button
            color="primary"
            onClick={() => {
              onUpdateSettings(`${identifier}Shortcut`, combinator);
              onCloseShortcutDialog();
            }}
          >
            {strings.save}
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
  onUpdateSettings: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  combinator: state.pages.settings.shortcutDialog.combinator,
  identifier: state.pages.settings.shortcutDialog.identifier,
  open: state.pages.settings.shortcutDialog.open,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onCloseShortcutDialog: () => dispatch(closeShortcutDialog()),
  onSetCombinator: combinator => dispatch(setCombinator(combinator)),
  onUpdateSettings: (name, value) => dispatch(updateSetting(name, value)),
});

export default connectComponent(
  DialogShortcut,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
