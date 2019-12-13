import React from 'react';
import PropTypes from 'prop-types';

import MenuItem from '@material-ui/core/MenuItem';
import AppBar from '@material-ui/core/AppBar';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import EnhancedMenu from '../../shared/enhanced-menu';

import { toggleSetting } from '../../../state/root/preferences/actions';
import { openShortcutDialog } from '../../../state/pages/preferences/shortcut-dialog/actions';

import displayLanguages from '../../../constants/display-languages';

import DialogShortcut from './dialog-shortcut';

import { requestSetPreference, requestShowRequireRestartDialog } from '../../../senders';

const { remote } = window.require('electron');

const styles = (theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  innerContainer: {
    flex: 1,
    padding: 16,
    boxSizing: 'border-box',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  paperTitle: {
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: 4,
    paddingLeft: 16,
    fontSize: 15,
    '&:not(:first-child)': {
      marginTop: 36,
    },
  },
  paper: {
    maxWidth: 480,
    margin: '0 auto',
  },
  shortcutKey: {
    lineHeight: '48px',
    padding: '0 16px',
    fontSize: 15,
    color: theme.palette.text.secondary,
  },
  appBarColorDefault: {
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});

const renderCombinator = (combinator) => combinator
  .replace(/\+/g, ' + ')
  .replace('alt', window.process.platform !== 'darwin' ? 'alt' : '⌥')
  .replace('shift', window.process.platform !== 'darwin' ? 'shift' : '⇧')
  .replace('mod', window.process.platform !== 'darwin' ? 'ctrl' : '⌘')
  .replace('meta', '⌘')
  .toUpperCase();

const Preferences = (props) => {
  const {
    alwaysOnTop,
    attachToMenubar,
    classes,
    langId,
    onOpenShortcutDialog,
    onToggleSetting,
    openOnMenubarShortcut,
    realtime,
    theme,
    translateClipboardOnShortcut,
    translateWhenPressingEnter,
  } = props;

  const displayLanguageKeys = Object.keys(displayLanguages);
  displayLanguageKeys.sort((xKey, yKey) => {
    const x = displayLanguages[xKey].displayName;
    const y = displayLanguages[yKey].displayName;
    return x.localeCompare(y);
  });


  return (
    <div className={classes.container}>
      <DialogShortcut />
      <AppBar position="static" color="default" classes={{ colorDefault: classes.appBarColorDefault }}>
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" className={classes.title}>{getLocale('preferences')}</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.innerContainer}>
        <Typography variant="body1" className={classes.paperTitle}>
          {getLocale('general')}
        </Typography>
        <Paper className={classes.paper}>
          <List dense>
            <EnhancedMenu
              id="changeDisplayLanguage"
              buttonElement={(
                <ListItem button>
                  <ListItemText
                    primary={getLocale('displayLanguage')}
                    secondary={displayLanguages[langId].displayName}
                  />
                  <ChevronRightIcon color="action" />
                </ListItem>
              )}
            >
              {displayLanguageKeys.map((lId) => (
                <MenuItem
                  key={`lang_${lId}`}
                  value={lId}
                  onClick={() => {
                    if (lId !== langId) {
                      requestSetPreference('langId', lId);
                      requestShowRequireRestartDialog();
                    }
                  }}
                >
                  {displayLanguages[lId].displayName}
                </MenuItem>
              ))}
            </EnhancedMenu>
            <Divider />
            <EnhancedMenu
              id="theme"
              buttonElement={(
                <ListItem button>
                  <ListItemText primary="Theme" secondary={getLocale(theme)} />
                  <ChevronRightIcon color="action" />
                </ListItem>
              )}
            >
              {window.process.platform === 'darwin' && (
                <MenuItem onClick={() => requestSetPreference('theme', 'systemDefault')}>{getLocale('systemDefault')}</MenuItem>
              )}
              <MenuItem onClick={() => requestSetPreference('theme', 'light')}>{getLocale('light')}</MenuItem>
              <MenuItem onClick={() => requestSetPreference('theme', 'dark')}>{getLocale('dark')}</MenuItem>
            </EnhancedMenu>
            <Divider />
            <ListItem>
              <ListItemText primary={window.process.platform === 'win32' ? getLocale('attachToTaskbar') : getLocale('attachToMenubar')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={attachToMenubar}
                  onChange={(e) => {
                    requestSetPreference('attachToMenubar', e.target.checked);
                    requestShowRequireRestartDialog();
                  }}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>


        <Typography variant="body1" className={classes.paperTitle}>
          {getLocale('advanced')}
        </Typography>
        <Paper className={classes.paper}>
          <List dense>
            <ListItem>
              <ListItemText primary={getLocale('realtime')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={realtime}
                  onChange={() => onToggleSetting('realtime')}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={getLocale('translateWhenPressingEnter')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={translateWhenPressingEnter}
                  onChange={() => onToggleSetting('translateWhenPressingEnter')}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            {window.process.platform === 'darwin' && (
              <>
                <Divider />
                <ListItem
                  button
                  onClick={() => remote.shell.openExternal('https://translatiumapp.com/popclip')}
                >
                  <ListItemText primary={getLocale('popclipExtension')} />
                </ListItem>
              </>
            )}
            {attachToMenubar && (
              <>
                <Divider />
                <ListItem
                  button
                  key="openOnMenubar"
                  onClick={() => onOpenShortcutDialog('openOnMenubar', openOnMenubarShortcut)}
                >
                  <ListItemText
                    primary={getLocale('openKeyboardShortcut')}
                    secondary={openOnMenubarShortcut
                      ? renderCombinator(openOnMenubarShortcut) : null}
                  />
                  <ChevronRightIcon color="action" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={getLocale('translateClipboardOnShortcut')}
                    secondary={getLocale('translateClipboardOnShortcutDesc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={attachToMenubar ? translateClipboardOnShortcut : false}
                      onChange={() => onToggleSetting('translateClipboardOnShortcut')}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={getLocale('alwaysOnTop')}
                    secondary={getLocale('alwaysOnTopDesc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={attachToMenubar ? alwaysOnTop : false}
                      onChange={(e) => {
                        requestSetPreference('alwaysOnTop', e.target.checked);
                        requestShowRequireRestartDialog();
                      }}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </>
            )}
          </List>
        </Paper>

        <Typography variant="body1" className={classes.paperTitle} />
        <Paper className={classes.paper}>
          <List dense>
            <ListItem button>
              <ListItemText primary={getLocale('quit')} onClick={() => remote.app.quit()} />
            </ListItem>
          </List>
        </Paper>
      </div>
    </div>
  );
};

Preferences.propTypes = {
  alwaysOnTop: PropTypes.bool.isRequired,
  attachToMenubar: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  langId: PropTypes.string.isRequired,
  onOpenShortcutDialog: PropTypes.func.isRequired,
  onToggleSetting: PropTypes.func.isRequired,
  openOnMenubarShortcut: PropTypes.string,
  realtime: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  translateClipboardOnShortcut: PropTypes.bool.isRequired,
  translateWhenPressingEnter: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  alwaysOnTop: state.preferences.alwaysOnTop,
  attachToMenubar: state.preferences.attachToMenubar,
  langId: state.preferences.langId,
  openOnMenubarShortcut: state.preferences.openOnMenubarShortcut,
  realtime: state.preferences.realtime,
  theme: state.preferences.theme,
  translateClipboardOnShortcut: state.preferences.translateClipboardOnShortcut,
  translateWhenPressingEnter: state.preferences.translateWhenPressingEnter,
});

const actionCreators = {
  openShortcutDialog,
  toggleSetting,
};

export default connectComponent(
  Preferences,
  mapStateToProps,
  actionCreators,
  styles,
);
