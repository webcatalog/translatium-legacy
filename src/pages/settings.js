/* global remote */
import React from 'react';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { MenuItem } from 'material-ui/Menu';
import Switch from 'material-ui/Switch';
import List, { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/Button';

import connectComponent from '../helpers/connect-component';

import EnhancedMenu from './enhanced-menu';

import { toggleSetting, updateSetting } from '../state/root/settings/actions';
import { updateStrings } from '../state/root/strings/actions';

import colorPairs from '../constants/colors';
import displayLanguages from '../constants/display-languages';

import getPlatform from '../helpers/get-platform';
import openUri from '../helpers/open-uri';

import { runApp } from '..';

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  innerContainer: {
    flex: 1,
    padding: 0,
    boxSizing: 'border-box',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
};

const Settings = (props) => {
  const {
    chinaMode,
    classes,
    darkMode,
    dockAndMenubar,
    langId,
    onSettingChange,
    onToggle,
    onUpdateStrings,
    preventScreenLock,
    primaryColorId,
    realtime,
    strings,
    translateWhenPressingEnter,
  } = props;

  const dockAndMenubarOpts = [
    'showOnBothDockAndMenubar',
    'onlyShowOnDock',
    'onlyShowOnMenubar',
  ];

  return (
    <div className={classes.container}>
      <AppBar position="static">
        <Toolbar>
          <Typography type="title" color="inherit">{strings.settings}</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.innerContainer}>
        <List>
          <ListItem>
            <ListItemText
              primary={strings.primaryColor}
              secondary={strings[primaryColorId]}
            />
            <ListItemSecondaryAction>
              <EnhancedMenu
                id="changeColor"
                buttonElement={(
                  <Button raised color="primary">
                    {strings.change}
                  </Button>
                )}
              >
                {Object.keys(colorPairs).map(colorId => (
                  <MenuItem
                    key={`color_${colorId}`}
                    value={colorId}
                    onClick={() => {
                      onSettingChange('primaryColorId', colorId);
                      runApp(true);
                    }}
                  >
                    {strings[colorId]}
                  </MenuItem>
                ))}
              </EnhancedMenu>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={strings.displayLanguage}
              secondary={displayLanguages[langId].displayName}
            />
            <ListItemSecondaryAction>
              <EnhancedMenu
                id="changeDisplayLanguage"
                buttonElement={(
                  <Button raised>
                    {strings.change}
                  </Button>
                )}
              >
                {Object.keys(displayLanguages).map(lId => (
                  <MenuItem
                    key={`lang_${lId}`}
                    value={lId}
                    onClick={() => {
                      if (lId !== langId) {
                        onSettingChange('langId', lId);
                        onUpdateStrings(lId);
                      }
                    }}
                  >
                    {displayLanguages[lId].displayName}
                  </MenuItem>
                ))}
              </EnhancedMenu>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary={strings.darkMode} />
            <ListItemSecondaryAction>
              <Switch
                checked={darkMode}
                onChange={() => {
                  onToggle('darkMode');
                  runApp(true);
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
          {getPlatform() === 'electron' && window.process.platform === 'darwin' && (
            <ListItem>
              <ListItemText
                primary={strings.dockAndMenubar}
                secondary={strings[dockAndMenubar]}
              />
              <ListItemSecondaryAction>
                <EnhancedMenu
                  id="changeDockMenubar"
                  buttonElement={(
                    <Button raised>
                      {strings.change}
                    </Button>
                  )}
                >
                  {dockAndMenubarOpts.map(opts => (
                    <MenuItem
                      key={`dockAndMenubarOpts_${opts}`}
                      value={opts}
                      onClick={() => {
                        onSettingChange('dockAndMenubar', opts);
                      }}
                    >
                      {strings[opts]}
                    </MenuItem>
                  ))}
                </EnhancedMenu>
              </ListItemSecondaryAction>
            </ListItem>
          )}
          <ListItem>
            <ListItemText primary={strings.realtime} />
            <ListItemSecondaryAction>
              <Switch
                checked={realtime}
                onChange={() => onToggle('realtime')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          {getPlatform() === 'windows' && (
            <ListItem>
              <ListItemText primary={strings.preventScreenLock} />
              <ListItemSecondaryAction>
                <Switch
                  checked={preventScreenLock}
                  onChange={() => onToggle('preventScreenLock')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          <ListItem>
            <ListItemText primary={strings.translateWhenPressingEnter} />
            <ListItemSecondaryAction>
              <Switch
                checked={translateWhenPressingEnter}
                onChange={() => onToggle('translateWhenPressingEnter')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={strings.chinaMode}
              secondary={strings.chinaModeDesc}
            />
            <ListItemSecondaryAction>
              <Switch
                checked={chinaMode}
                onChange={() => onToggle('chinaMode')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          {getPlatform() === 'windows' && (
            <ListItem button onClick={() => openUri('ms-windows-store://review/?ProductId=9wzdncrcsg9k')} role="link">
              <ListItemText primary={strings.rateWindowsStore} />
            </ListItem>
          )}
          {getPlatform() === 'electron' && (
            <ListItem button onClick={() => openUri('macappstore://itunes.apple.com/app/id1176624652?mt=12')} role="link">
              <ListItemText primary={strings.rateMacAppStore} />
            </ListItem>
          )}
          <ListItem button onClick={() => openUri('https://moderntranslator.com/support')} role="link">
            <ListItemText primary={strings.help} />
          </ListItem>
          <ListItem button onClick={() => openUri('https://moderntranslator.com')} role="link">
            <ListItemText primary={strings.website} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={`Version ${process.env.REACT_APP_VERSION}`} />
          </ListItem>
          <Divider />
          {getPlatform() === 'electron' && (
            <ListItem button>
              <ListItemText primary={strings.quit} onClick={() => remote.app.quit()} />
            </ListItem>
          )}
        </List>
      </div>
    </div>
  );
};

Settings.propTypes = {
  chinaMode: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  darkMode: PropTypes.bool.isRequired,
  dockAndMenubar: PropTypes.bool.isRequired,
  langId: PropTypes.string.isRequired,
  onSettingChange: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onUpdateStrings: PropTypes.func.isRequired,
  preventScreenLock: PropTypes.bool.isRequired,
  primaryColorId: PropTypes.string.isRequired,
  realtime: PropTypes.bool.isRequired,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  translateWhenPressingEnter: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  chinaMode: state.settings.chinaMode,
  darkMode: state.settings.darkMode,
  dockAndMenubar: state.settings.dockAndMenubar,
  langId: state.settings.langId,
  preventScreenLock: state.settings.preventScreenLock,
  primaryColorId: state.settings.primaryColorId,
  realtime: state.settings.realtime,
  strings: state.strings,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
});

const mapDispatchToProps = dispatch => ({
  onToggle: name => dispatch(toggleSetting(name)),
  onSettingChange: (name, value) => dispatch(updateSetting(name, value)),
  onUpdateStrings: langId => dispatch(updateStrings(langId)),
});

export default connectComponent(
  Settings,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
