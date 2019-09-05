import React from 'react';
import PropTypes from 'prop-types';

import MenuItem from '@material-ui/core/MenuItem';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
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

import colorPairs from '../../../constants/colors';
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
    maxWidth: 720,
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
    maxWidth: 720,
    margin: '0 auto',
  },
  paperAbout: {
    maxWidth: 720,
    margin: '0 auto',
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  shortcutKey: {
    lineHeight: '48px',
    padding: '0 16px',
    fontSize: 15,
    color: theme.palette.text.secondary,
  },
  madeBy: {
    marginTop: theme.spacing.unit * 2,
  },
  link: {
    fontWeight: 600,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  icon: {
    height: 96,
    width: 96,
  },
  title: {
    marginTop: theme.spacing.unit,
  },
  version: {
    marginBottom: theme.spacing.unit * 2,
  },
});

const renderCombinator = (combinator) => combinator
  .replace(/\+/g, ' + ')
  .replace('alt', window.process.platform !== 'darwin' ? 'alt' : '⌥')
  .replace('shift', window.process.platform !== 'darwin' ? 'shift' : '⇧')
  .replace('mod', window.process.platform !== 'darwin' ? 'ctrl' : '⌘')
  .replace('meta', '⌘')
  .toUpperCase();

const getVersion = () => remote.app.getVersion();

const Preferences = (props) => {
  const {
    attachToMenubar,
    classes,
    clearInputShortcut,
    langId,
    locale,
    onOpenShortcutDialog,
    onToggle,
    onUpdateLocale,
    openImageFileShortcut,
    openInputLangListShortcut,
    openOutputLangListShortcut,
    primaryColorId,
    realtime,
    saveToPhrasebookShortcut,
    swapLanguagesShortcut,
    theme,
    translateWhenPressingEnter,
  } = props;

  const shortcuts = [
    { identifier: 'openInputLangList', combinator: openInputLangListShortcut },
    { identifier: 'openOutputLangList', combinator: openOutputLangListShortcut },
    { identifier: 'swapLanguages', combinator: swapLanguagesShortcut },
    { identifier: 'clearInput', combinator: clearInputShortcut },
    { identifier: 'openImageFile', combinator: openImageFileShortcut },
    { identifier: 'saveToPhrasebook', combinator: saveToPhrasebookShortcut },
  ];

  return (
    <div className={classes.container}>
      <DialogShortcut />
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="title" color="inherit">{locale.preferences}</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.innerContainer}>
        <Typography variant="body2" className={classes.paperTitle}>
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
                  <ChevronRightIcon color="action" />
                </ListItem>
              )}
            >
              {Object.keys(displayLanguages).map((lId) => (
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
                  <ChevronRightIcon color="action" />
                </ListItem>
              )}
            >
              {window.process.platform === 'darwin' && (
                <MenuItem onClick={() => requestSetPreference('theme', 'automatic')}>{locale.automatic}</MenuItem>
              )}
              <MenuItem onClick={() => requestSetPreference('theme', 'light')}>{locale.light}</MenuItem>
              <MenuItem onClick={() => requestSetPreference('theme', 'dark')}>{locale.dark}</MenuItem>
            </EnhancedMenu>
            <Divider />
            <EnhancedMenu
              id="changeColor"
              buttonElement={(
                <ListItem button>
                  <ListItemText
                    primary={locale.primaryColor}
                    secondary={locale[primaryColorId]}
                  />
                  <ChevronRightIcon color="action" />
                </ListItem>
              )}
            >
              {Object.keys(colorPairs).map((colorId) => (
                <MenuItem
                  key={`color_${colorId}`}
                  value={colorId}
                  onClick={() => {
                    requestSetPreference('primaryColorId', colorId);
                  }}
                >
                  {locale[colorId]}
                </MenuItem>
              ))}
            </EnhancedMenu>
            <Divider />
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
          </List>
        </Paper>

        <Typography variant="body2" className={classes.paperTitle}>
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

        <Typography variant="body2" className={classes.paperTitle}>
          {locale.shortcuts}
        </Typography>
        <Paper className={classes.paper}>
          <List dense>
            {shortcuts.map(({ identifier, combinator }, i) => (
              <React.Fragment key={`listitem${identifier}${combinator}`}>
                {i > 0 && <Divider />}
                <ListItem
                  button
                  key={identifier}
                  onClick={() => onOpenShortcutDialog(identifier, combinator)}
                >
                  <ListItemText
                    primary={locale[identifier]}
                    secondary={renderCombinator(combinator)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      className={classes.button}
                      aria-label={locale.change}
                      onClick={() => onOpenShortcutDialog(identifier, combinator)}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Typography variant="body2" className={classes.paperTitle} />
        <Paper className={classes.paper}>
          <List dense>
            <ListItem button>
              <ListItemText primary={locale.quit} onClick={() => remote.app.quit()} />
            </ListItem>
          </List>
        </Paper>

        <Typography variant="body2" className={classes.paperTitle}>
          {locale.about}
        </Typography>
        <Paper className={classes.paperAbout}>
          <Typography variant="title" className={classes.title}>Translatium</Typography>
          <Typography variant="body1" className={classes.version}>
            Version
            {` ${getVersion()}`}
          </Typography>

          {window.process.platform === 'win32' && (
            <>
              <Button onClick={() => remote.shell.openExternal('ms-windows-store://review/?ProductId=9wzdncrcsg9k')}>
                {locale.rateMicrosoftStore}
              </Button>
              <br />
            </>
          )}
          {window.process.platform === 'darwin' && (
            <>
              <Button onClick={() => remote.shell.openExternal('macappstore://itunes.apple.com/app/id1176624652?mt=12')}>
                {locale.rateMacAppStore}
              </Button>
              <br />
            </>
          )}
          <Button onClick={() => remote.shell.openExternal('https://translatiumapp.com')}>
            {locale.website}
          </Button>
          <br />
          <Button onClick={() => remote.shell.openExternal('https://translatiumapp.com/support')}>
            {locale.support}
          </Button>
          <br />

          <Typography variant="body1" className={classes.madeBy}>
            <span>Made with </span>
            <span role="img" aria-label="love">❤</span>
            <span> by </span>
            <span
              onClick={() => remote.shell.openExternal('https://quanglam2807.com')}
              role="link"
              tabIndex="0"
              className={classes.link}
            >
              Quang Lam
            </span>
          </Typography>
        </Paper>
      </div>
    </div>
  );
};

Preferences.propTypes = {
  attachToMenubar: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  clearInputShortcut: PropTypes.string.isRequired,
  langId: PropTypes.string.isRequired,
  locale: PropTypes.object.isRequired,
  onOpenShortcutDialog: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onUpdateLocale: PropTypes.func.isRequired,
  openImageFileShortcut: PropTypes.string.isRequired,
  openInputLangListShortcut: PropTypes.string.isRequired,
  openOutputLangListShortcut: PropTypes.string.isRequired,
  primaryColorId: PropTypes.string.isRequired,
  realtime: PropTypes.bool.isRequired,
  saveToPhrasebookShortcut: PropTypes.string.isRequired,
  swapLanguagesShortcut: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  translateWhenPressingEnter: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  attachToMenubar: state.preferences.attachToMenubar,
  clearInputShortcut: state.preferences.clearInputShortcut,
  langId: state.preferences.langId,
  openImageFileShortcut: state.preferences.openImageFileShortcut,
  openInputLangListShortcut: state.preferences.openInputLangListShortcut,
  openOutputLangListShortcut: state.preferences.openOutputLangListShortcut,
  primaryColorId: state.preferences.primaryColorId,
  realtime: state.preferences.realtime,
  saveToPhrasebookShortcut: state.preferences.saveToPhrasebookShortcut,
  swapLanguagesShortcut: state.preferences.swapLanguagesShortcut,
  theme: state.preferences.theme,
  translateWhenPressingEnter: state.preferences.translateWhenPressingEnter,
  locale: state.locale,
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
