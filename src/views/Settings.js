/* global Windows */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { parseString as parseXMLString } from 'xml2js';

import AppBar from 'material-ui/AppBar';
import { MenuItem } from 'material-ui/Menu';
import Switch from 'material-ui/Switch';
import List, { ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/Button';

import EnhancedMenu from './EnhancedMenu';

import { toggleSetting, updateSetting } from '../actions/settings';
import { updateShouldShowAd } from '../actions/ad';
import { openSnackbar } from '../actions/snackbar';
import { updateStrings } from '../actions/strings';

import colorPairs from '../constants/colorPairs';
import displayLanguages from '../constants/displayLanguages';

import getPlatform from '../libs/getPlatform';
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
      displayLanguage,
      shouldShowAd,
      preventScreenLock,
      translateWhenPressingEnter,
      strings,
      onToggle,
      onSettingChange,
      onRemoveAdClick,
      onRestorePurchaseClick,
      onUpdateStrings,
    } = this.props;
    const styles = this.getStyles();

    return (
      <div style={styles.container}>
        <AppBar
          title={strings.settings}
          showMenuIconButton={false}
        />
        <div style={styles.innerContainer}>
          <List>
            <ListItem
              rightIconButton={(
                <EnhancedMenu
                  id="changeColor"
                  buttonElement={(
                    <Button
                      raised
                      label={strings.change}
                      primary
                    />
                  )}
                >
                  {Object.keys(colorPairs).map(colorId => (
                    <MenuItem key={`color_${colorId}`} value={colorId} primaryText={strings[colorId]} onClick={() => onSettingChange('primaryColorId', colorId)} />
                  ))}
                </EnhancedMenu>
              )}
              primaryText={strings.primaryColor}
              secondaryText={strings[primaryColorId]}
            />
            <ListItem
              rightIconButton={(
                <EnhancedMenu
                  id="changeDisplayLanguage"
                  buttonElement={(
                    <Button
                      raised
                      label={strings.change}
                      primary
                    />
                  )}
                >
                  {Object.keys(displayLanguages).map(langId => (
                    <MenuItem
                      key={`lang_${langId}`}
                      value={langId}
                      primaryText={displayLanguages[langId].displayName}
                      onClick={() => {
                        if (langId !== displayLanguage) {
                          onSettingChange('displayLanguage', langId);
                          onUpdateStrings(langId);
                        }
                      }}
                    />
                  ))}
                </EnhancedMenu>
              )}
              primaryText={strings.displayLanguage}
              secondaryText={displayLanguages[displayLanguage].displayName}
            />
            <ListItem
              primaryText={strings.darkMode}
              rightToggle={(
                <Switch
                  checked={darkMode}
                  onChange={() => onToggle('darkMode')}
                />
              )}
            />
            <ListItem
              primaryText={strings.realtime}
              rightToggle={(
                <Switch
                  checked={realtime}
                  onChange={() => onToggle('realtime')}
                />
              )}
            />
            {getPlatform() === 'windows' ? (
              <ListItem
                primaryText={strings.preventScreenLock}
                rightToggle={(
                  <Switch
                    checked={preventScreenLock}
                    onChange={() => onToggle('preventScreenLock')}
                  />
                )}
              />
            ) : null}
            <ListItem
              primaryText={strings.translateWhenPressingEnter}
              rightToggle={(
                <Switch
                  checked={translateWhenPressingEnter}
                  onChange={() => onToggle('translateWhenPressingEnter')}
                />
              )}
            />
            <ListItem
              primaryText={strings.chinaMode}
              rightToggle={(
                <Switch
                  checked={chinaMode}
                  onChange={() => onToggle('chinaMode')}
                />
              )}
              secondaryText={strings.chinaModeDesc}
            />
            <Divider />
            {getPlatform() === 'windows' && shouldShowAd ? (
              <ListItem
                primaryText={strings.removeAds}
                onClick={() => onRemoveAdClick(strings)}
              />
            ) : null}
            {getPlatform() === 'windows' && shouldShowAd ? (
              <ListItem
                primaryText={strings.restorePurchase}
                secondaryText={strings.restorePurchaseDesc}
                onClick={() => onRestorePurchaseClick(strings)}
              />
            ) : null}
            {getPlatform() === 'windows' && !shouldShowAd ? (
              <ListItem
                primaryText={strings.removeAds}
                secondaryText={strings.activated}
              />
            ) : null}
            <Divider />
            {getPlatform() === 'windows' ? (
              <ListItem
                primaryText={strings.rateWindowsStore}
                onClick={() => openUri('ms-windows-store://review/?ProductId=9wzdncrcsg9k')}
              />
            ) : null}
            {getPlatform() === 'mac' ? (
              <ListItem
                primaryText={strings.rateMacAppStore}
                onClick={() => openUri('macappstore://itunes.apple.com/app/id1176624652?mt=12')}
              />
            ) : null}
            <ListItem primaryText={strings.help} onClick={() => openUri('https://moderntranslator.com/support')} />
            <ListItem primaryText={strings.website} onClick={() => openUri('https://moderntranslator.com')} />
            <Divider />
            <ListItem primaryText={`Version ${process.env.REACT_APP_VERSION}`} />
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
  displayLanguage: PropTypes.string,
  shouldShowAd: PropTypes.bool,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
  onSettingChange: PropTypes.func.isRequired,
  onRemoveAdClick: PropTypes.func.isRequired,
  onRestorePurchaseClick: PropTypes.func.isRequired,
  onUpdateStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  darkMode: state.settings.darkMode,
  primaryColorId: state.settings.primaryColorId,
  preventScreenLock: state.settings.preventScreenLock,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
  realtime: state.settings.realtime,
  chinaMode: state.settings.chinaMode,
  displayLanguage: state.settings.displayLanguage,
  shouldShowAd: state.ad.shouldShowAd,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onToggle: name => dispatch(toggleSetting(name)),
  onSettingChange: (name, value) => dispatch(updateSetting(name, value)),
  onRemoveAdClick: (strings) => {
    const currentApp = process.env.NODE_ENV === 'production' ? Windows.ApplicationModel.Store.CurrentApp
                    : Windows.ApplicationModel.Store.CurrentAppSimulator;

    const purchaseStatus = Windows.ApplicationModel.Store.ProductPurchaseStatus;

    currentApp.requestProductPurchaseAsync('remove.ads.durable')
      .done((purchaseResults) => {
        if (purchaseResults.status === purchaseStatus.succeeded) {
          dispatch(updateShouldShowAd(false));
        }
      }, () => {
        dispatch(openSnackbar(strings.somethingWentWrong));
      });
  },
  onRestorePurchaseClick: (strings) => {
    const currentApp = process.env.NODE_ENV === 'production' ? Windows.ApplicationModel.Store.CurrentApp
                    : Windows.ApplicationModel.Store.CurrentAppSimulator;

    const purchaseStatus = Windows.ApplicationModel.Store.ProductPurchaseStatus;

    currentApp.getAppReceiptAsync().done((xmlReceipt) => {
      parseXMLString(xmlReceipt, (err, receipt) => {
        if (err) return;
        // const licenseType = receipt.Receipt.AppReceipt[0].$.LicenseType;

        const purchaseDate = receipt.Receipt.AppReceipt[0].$.PurchaseDate;

        if (new Date(purchaseDate) <= new Date('2017-05-15T05:00:00Z')) {
          currentApp.requestProductPurchaseAsync('remove.ads.free')
            .done((purchaseResults) => {
              if (purchaseResults.status === purchaseStatus.succeeded) {
                dispatch(updateShouldShowAd(false));
              }
            }, () => {
              dispatch(openSnackbar(strings.somethingWentWrong));
            });
        } else {
          dispatch(openSnackbar(strings.notQualified));
        }
      });
    }, () => {
      dispatch(openSnackbar(strings.somethingWentWrong));
    });
  },
  onUpdateStrings: langId => dispatch(updateStrings(langId)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Settings);

// f
