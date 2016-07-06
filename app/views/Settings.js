/* global Windows WinJS */

import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';

import Animation from './Animation';

import i18n from '../i18n';

import { materialDesignColors } from '../constants/colors';

import { updateSetting } from '../actions/settings';
import isFull from '../lib/isFull';
import showUpgradeDialog from '../lib/showUpgradeDialog';

const Settings = ({
  theme,
  primaryColorId,
  chinaMode,
  realtime,
  preventingScreenLock,
  translateWhenPressingEnter,
  onSettingChange,
}) => (
  <Animation name="enterPage">
    <div className="app-settings-page">
      <h4 className="win-h4">
        {i18n('personalization')}
      </h4>
      <h5 className="win-h5" style={{ marginTop: 6, marginBottom: 6 }}>
        {i18n('theme')}
      </h5>
      <div>
        {['light', 'dark'].map(t => {
          let itemClassName = 'app-color-item';
          if (theme === t) {
            itemClassName += ' active';
          }
          return (
            <div
              className={itemClassName}
              style={{ backgroundColor: (t === 'light') ? '#ffffff' : '#000000' }}
              key={t}
              onClick={() => onSettingChange('theme', t)}
            />
          );
        })}
      </div>
      <h5 className="win-h5" style={{ marginTop: 12, marginBottom: 6 }}>
        {i18n('primary-color')}
      </h5>
      <div>
        {Object.keys(materialDesignColors).map(i => {
          let itemClassName = 'app-color-item';
          if (primaryColorId === i) {
            itemClassName += ' active';
          }
          return (
            <div
              className={itemClassName}
              style={{ backgroundColor: materialDesignColors[i].light }}
              key={i}
              onClick={() => onSettingChange('primaryColorId', i)}
            />
          );
        })}
      </div>
      <h4 className="win-h4" style={{ marginTop: 24 }}>
        {i18n('general')}
      </h4>
      <h5 className="win-h5" style={{ marginTop: 6 }}>
        {i18n('china-mode')}
      </h5>
      <ReactWinJS.ToggleSwitch
        checked={chinaMode}
        onChange={e => onSettingChange('chinaMode', e.currentTarget.winControl.checked)}
      />
      <h6 className="win-h6">
        {i18n('china-mode-desc')}
      </h6>

      <h5 className="win-h5" style={{ marginTop: 12 }}>
        {i18n('real-time-translation')}
      </h5>
      <ReactWinJS.ToggleSwitch
        checked={realtime}
        onChange={e => onSettingChange('realtime', e.currentTarget.winControl.checked)}
      />
      <h5 className="win-h5" style={{ marginTop: 12 }}>
        {i18n('preventing-screen-lock')}
      </h5>
      <ReactWinJS.ToggleSwitch
        checked={preventingScreenLock}
        onChange={e => onSettingChange('preventingScreenLock', e.currentTarget.winControl.checked)}
      />
      <h5 className="win-h5" style={{ marginTop: 12 }}>
        {i18n('translate-when-pressing-enter')}
      </h5>
      <ReactWinJS.ToggleSwitch
        checked={translateWhenPressingEnter}
        onChange={e =>
          onSettingChange('translateWhenPressingEnter', e.currentTarget.winControl.checked)}
      />
      <div style={{ height: 2 }} />
    </div>
  </Animation>
);

Settings.propTypes = {
  theme: React.PropTypes.string.isRequired,
  primaryColorId: React.PropTypes.string.isRequired,
  chinaMode: React.PropTypes.bool.isRequired,
  realtime: React.PropTypes.bool.isRequired,
  preventingScreenLock: React.PropTypes.bool.isRequired,
  translateWhenPressingEnter: React.PropTypes.bool.isRequired,
  onSettingChange: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  theme: state.settings.theme,
  primaryColorId: state.settings.primaryColorId,
  chinaMode: state.settings.chinaMode,
  realtime: state.settings.realtime,
  preventingScreenLock: state.settings.preventingScreenLock,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
});

const mapDispatchToProps = (dispatch) => ({
  onSettingChange: (name, value) => {
    if ((name === 'theme' || name === 'primary-color') && isFull() !== true) {
      showUpgradeDialog();
    } else {
      dispatch(updateSetting(name, value));
    }
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Settings);
