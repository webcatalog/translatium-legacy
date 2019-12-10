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

import EnhancedMenu from '../enhanced-menu';

import { toggleSetting } from '../../../state/root/preferences/actions';
import { updateLocale } from '../../../state/root/locale/actions';
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
    locale,
    onOpenShortcutDialog,
    onToggle,
    onUpdateLocale,
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
          <Typography variant="h6" color="inherit">{locale.preferences}</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.innerContainer}>
        <Typography variant="body1" className={classes.paperTitle}>
          {locale.appearance}
        </Typography>
        <Paper className={classes.paper}>
          <List dense>
            <EnhancedMenu
              id="changeDisplayLanguage"
              buttonElement={(
                <ListItem button>
                  <ListItemText
                    primary={locale.displayLanguage}
                    secondary={displayLanguages[langId].displayName}
                  />
                  <ChevronRightIcon color="action" aria-label={locale.change} />
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
                      onUpdateLocale(lId);
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
                  <ListItemText primary="Theme" secondary={locale[theme]} />
                  <ChevronRightIcon color="action" aria-label={locale.change} />
                </ListItem>
              )}
            >
              {window.process.platform === 'darwin' && (
                <MenuItem onClick={() => requestSetPreference('theme', 'systemDefault')}>{locale.systemDefault}</MenuItem>
              )}
              <MenuItem onClick={() => requestSetPreference('theme', 'light')}>{locale.light}</MenuItem>
              <MenuItem onClick={() => requestSetPreference('theme', 'dark')}>{locale.dark}</MenuItem>
            </EnhancedMenu>
          </List>
        </Paper>

        <Typography variant="body1" className={classes.paperTitle}>
          {window.process.platform === 'win32' ? locale.taskbar : locale.menubar}
        </Typography>
        <Paper className={classes.paper}>
          <List dense>
            <ListItem>
              <ListItemText primary={window.process.platform === 'win32' ? locale.attachToTaskbar : locale.attachToMenubar} />
              <ListItemSecondaryAction>
                <Switch
                  checked={attachToMenubar}
                  onChange={(e) => {
                    requestSetPreference('attachToMenubar', e.target.checked);
                    requestShowRequireRestartDialog();
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem
              button
              disabled={!attachToMenubar}
              key="openOnMenubar"
              onClick={() => onOpenShortcutDialog('openOnMenubar', openOnMenubarShortcut)}
            >
              <ListItemText
                primary={window.process.platform === 'win32' ? locale.openOnTaskbar : locale.openOnMenubar}
                secondary={openOnMenubarShortcut
                  ? renderCombinator(openOnMenubarShortcut) : locale.openOnMenubarDesc}
              />
              <ChevronRightIcon color="action" aria-label={locale.change} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={locale.translateClipboardOnShortcut}
                secondary={locale.translateClipboardOnShortcutDesc}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={attachToMenubar ? translateClipboardOnShortcut : false}
                  disabled={!attachToMenubar}
                  onChange={() => onToggle('translateClipboardOnShortcut')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={locale.alwaysOnTop}
                secondary={locale.alwaysOnTopDesc}
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={attachToMenubar ? alwaysOnTop : false}
                  disabled={!attachToMenubar}
                  onChange={(e) => {
                    requestSetPreference('alwaysOnTop', e.target.checked);
                    requestShowRequireRestartDialog();
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>

        <Typography variant="body1" className={classes.paperTitle}>
          {locale.advanced}
        </Typography>
        <Paper className={classes.paper}>
          <List dense>
            <ListItem>
              <ListItemText primary={locale.realtime} />
              <ListItemSecondaryAction>
                <Switch
                  checked={realtime}
                  onChange={() => onToggle('realtime')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={locale.translateWhenPressingEnter} />
              <ListItemSecondaryAction>
                <Switch
                  checked={translateWhenPressingEnter}
                  onChange={() => onToggle('translateWhenPressingEnter')}
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
                  <ListItemText primary={locale.popclipExtension} />
                </ListItem>
              </>
            )}
          </List>
        </Paper>

        <Typography variant="body1" className={classes.paperTitle} />
        <Paper className={classes.paper}>
          <List dense>
            <ListItem button>
              <ListItemText primary={locale.quit} onClick={() => remote.app.quit()} />
            </ListItem>
          </List>
        </Paper>
      </div>
    </div>
  );
};

Preferences.propTypes = {
  attachToMenubar: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  langId: PropTypes.string.isRequired,
  locale: PropTypes.object.isRequired,
  onOpenShortcutDialog: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onUpdateLocale: PropTypes.func.isRequired,
  openOnMenubarShortcut: PropTypes.string,
  realtime: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  translateWhenPressingEnter: PropTypes.bool.isRequired,
  translateClipboardOnShortcut: PropTypes.bool.isRequired,
  alwaysOnTop: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  attachToMenubar: state.preferences.attachToMenubar,
  langId: state.preferences.langId,
  locale: state.locale,
  realtime: state.preferences.realtime,
  theme: state.preferences.theme,
  translateWhenPressingEnter: state.preferences.translateWhenPressingEnter,
  alwaysOnTop: state.preferences.alwaysOnTop,
  openOnMenubarShortcut: state.preferences.openOnMenubarShortcut,
  translateClipboardOnShortcut: state.preferences.translateClipboardOnShortcut,
});

const mapDispatchToProps = (dispatch) => ({
  onToggle: (name) => dispatch(toggleSetting(name)),
  onOpenShortcutDialog: (identifier, combinator) => dispatch(
    openShortcutDialog(identifier, combinator),
  ),
  onUpdateLocale: (lId) => dispatch(updateLocale(lId)),
});

export default connectComponent(
  Preferences,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
