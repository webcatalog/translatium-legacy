/* global strings */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import { grey400 } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';

import { toggleSetting, updateSetting } from '../actions/settings';

import colorPairs from '../constants/colorPairs';

import openUri from '../libs/openUri';

class Settings extends React.Component {
  getStyles() {
    return {
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
  }

  render() {
    const {
      darkMode,
      realtime,
      primaryColorId,
      chinaMode,
      preventScreenLock,
      translateWhenPressingEnter,
      onToggle,
      onSettingChange,
    } = this.props;
    const styles = this.getStyles();

    return (
      <div style={styles.container}>
        <AppBar
          title="Settings"
          showMenuIconButton={false}
        />
        <div style={styles.innerContainer}>
          <List>
            <ListItem
              rightIconButton={(
                <IconMenu
                  iconButtonElement={(
                    <IconButton
                      touch
                      tooltip="more"
                      tooltipPosition="bottom-left"
                    >
                      <MoreVertIcon color={grey400} />
                    </IconButton>
                  )}
                >
                  {Object.keys(colorPairs).map(colorId => (
                    <MenuItem key={`color_${colorId}`} value={colorId} primaryText={strings[colorId]} onTouchTap={() => onSettingChange('primaryColorId', colorId)} />
                  ))}
                </IconMenu>
              )}
              primaryText={strings.primaryColor}
              secondaryText={strings[primaryColorId]}
            />
            <ListItem
              primaryText={strings.darkMode}
              rightToggle={(
                <Toggle
                  toggled={darkMode}
                  onToggle={() => onToggle('darkMode')}
                />
              )}
            />
            <ListItem
              primaryText={strings.realtime}
              rightToggle={(
                <Toggle
                  toggled={realtime}
                  onToggle={() => onToggle('realtime')}
                />
              )}
            />
            {process.env.PLATFORM === 'windows' ? (
              <ListItem
                primaryText={strings.preventScreenLock}
                rightToggle={(
                  <Toggle
                    toggled={preventScreenLock}
                    onToggle={() => onToggle('preventScreenLock')}
                  />
                )}
              />
            ) : null}
            <ListItem
              primaryText={strings.translateWhenPressingEnter}
              rightToggle={(
                <Toggle
                  toggled={translateWhenPressingEnter}
                  onToggle={() => onToggle('translateWhenPressingEnter')}
                />
              )}
            />
            <ListItem
              primaryText={strings.chinaMode}
              rightToggle={(
                <Toggle
                  toggled={chinaMode}
                  onToggle={() => onToggle('chinaMode')}
                />
              )}
              secondaryText={strings.chinaModeDesc}
            />
            <Divider />
            {process.env.PLATFORM === 'windows' ? (
              <ListItem
                primaryText={strings.rateWindowsStore}
                onTouchTap={() => openUri('ms-windows-store://review/?ProductId=9wzdncrcsg9k')}
              />
            ) : null}
            {process.env.PLATFORM === 'mac' ? (
              <ListItem
                primaryText={strings.rateMacAppStore}
                onTouchTap={() => openUri('macappstore://itunes.apple.com/app/id1176624652?mt=12')}
              />
            ) : null}
            <ListItem primaryText={strings.help} onTouchTap={() => openUri('https://moderntranslator.com/support')} />
            <ListItem primaryText={strings.website} onTouchTap={() => openUri('https://moderntranslator.com')} />
            <Divider />
            <ListItem primaryText={`Version ${process.env.VERSION}`} />
          </List>
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  darkMode: PropTypes.bool,
  primaryColorId: PropTypes.string,
  preventScreenLock: PropTypes.bool,
  translateWhenPressingEnter: PropTypes.bool,
  realtime: PropTypes.bool,
  chinaMode: PropTypes.bool,
  onToggle: PropTypes.func,
  onSettingChange: PropTypes.func,
};

const mapStateToProps = state => ({
  darkMode: state.settings.darkMode,
  primaryColorId: state.settings.primaryColorId,
  preventScreenLock: state.settings.preventScreenLock,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
  realtime: state.settings.realtime,
  chinaMode: state.settings.chinaMode,
});

const mapDispatchToProps = dispatch => ({
  onToggle: (name) => {
    dispatch(toggleSetting(name));
  },
  onSettingChange: (name, value) => {
    dispatch(updateSetting(name, value));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Settings);
