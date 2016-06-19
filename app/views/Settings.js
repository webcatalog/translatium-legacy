/* global Windows WinJS */

import React from 'react';
import ReactWinJS from 'react-winjs';
import { connect } from 'react-redux';

import Animation from './Animation';

import i18n from '../i18n';

import { materialDesignColors } from '../constants/colors';

import { updateSetting } from '../actions/settings';

const Settings = ({
  theme,
  primaryColorId,
  chinaMode,
  realtime,
  preventingScreenLock,
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
      <h4 className="win-h4" style={{ marginTop: 24 }}>
        {i18n('advanced')}
      </h4>
      <h5 className="win-h5" style={{ marginTop: 12 }}>
        {i18n('preventing-screen-lock')}
      </h5>
      <ReactWinJS.ToggleSwitch
        checked={preventingScreenLock}
        onChange={e => onSettingChange('preventingScreenLock', e.currentTarget.winControl.checked)}
      />
      <div style={{ height: 2 }} />
    </div>
  </Animation>
);

Settings.propTypes = {
  theme: React.PropTypes.string,
  primaryColorId: React.PropTypes.string,
  chinaMode: React.PropTypes.bool,
  realtime: React.PropTypes.bool,
  preventingScreenLock: React.PropTypes.bool,
  onSettingChange: React.PropTypes.func,
};

const mapStateToProps = (state) => ({
  theme: state.settings.theme,
  primaryColorId: state.settings.primaryColorId,
  chinaMode: state.settings.chinaMode,
  realtime: state.settings.realtime,
  preventingScreenLock: state.settings.preventingScreenLock,
});

const mapDispatchToProps = (dispatch) => ({
  onSettingChange: (name, value) => {
    dispatch(updateSetting(name, value));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Settings);
