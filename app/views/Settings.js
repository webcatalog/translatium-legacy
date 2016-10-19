/* global strings */
import React from 'react';
import { connect } from 'react-redux';

import AppBar from 'material-ui/AppBar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';

import { toggleSetting, updateSetting } from '../actions/settings';

import colorPairs from '../constants/colorPairs';

class Settings extends React.Component {
  getStyles() {
    return {
      container: {
        flex: 1,
      },
      innerContainer: {
        padding: '12px 24px',
        boxSizing: 'border-box',
        maxWidth: 500,
      },
    };
  }

  render() {
    const {
      theme,
      primaryColorId,
      preventScreenLock,
      translateWhenPressingEnter,
      onToggle,
      onSelectFieldChange,
    } = this.props;
    const styles = this.getStyles();

    return (
      <div style={styles.container}>
        <AppBar
          title="Settings"
          showMenuIconButton={false}
        />
        <div style={styles.innerContainer}>
          <SelectField
            value={theme}
            floatingLabelText={strings.theme}
            floatingLabelFixed
            onChange={(e, index, value) => onSelectFieldChange('theme', value)}
          >
            <MenuItem key="light" value="light" primaryText="Light" />
            <MenuItem key="dark" value="dark" primaryText="Dark" />
          </SelectField>
          <br />
          <SelectField
            value={primaryColorId}
            floatingLabelText={strings.primaryColor}
            floatingLabelFixed
            maxHeight={200}
            onChange={(e, index, value) => onSelectFieldChange('primaryColorId', value)}
          >
            {Object.keys(colorPairs).map(colorId => (
              <MenuItem key={colorId} value={colorId} primaryText={strings[colorId]} />
            ))}
          </SelectField>
          <br /><br />
          <Toggle
            label={strings.preventScreenLock}
            toggled={preventScreenLock}
            onToggle={() => onToggle('preventScreenLock')}
          />
          <br />
          <Toggle
            label={strings.translateWhenPressingEnter}
            toggled={translateWhenPressingEnter}
            onToggle={() => onToggle('translateWhenPressingEnter')}
          />
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  theme: React.PropTypes.string,
  primaryColorId: React.PropTypes.string,
  preventScreenLock: React.PropTypes.bool,
  translateWhenPressingEnter: React.PropTypes.bool,
  onToggle: React.PropTypes.func,
  onSelectFieldChange: React.PropTypes.func,
};

const mapStateToProps = state => ({
  theme: state.settings.theme,
  primaryColorId: state.settings.primaryColorId,
  preventScreenLock: state.settings.preventScreenLock,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
});

const mapDispatchToProps = dispatch => ({
  onToggle: (name) => {
    dispatch(toggleSetting(name));
  },
  onSelectFieldChange: (name, value) => {
    dispatch(updateSetting(name, value));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Settings);
