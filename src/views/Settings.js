/* global strings Windows */
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

import { parseString as parseXMLString } from 'xml2js';

import { toggleSetting, updateSetting } from '../actions/settings';
import { updateShouldShowAd } from '../actions/ad';
import { openSnackbar } from '../actions/snackbar';

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
      shouldShowAd,
      preventScreenLock,
      translateWhenPressingEnter,
      onToggle,
      onSettingChange,
      onRemoveAdTouchTap,
      onRestorePurchaseTouchTap,
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
            {process.env.PLATFORM === 'windows' && shouldShowAd ? (
              <ListItem
                primaryText={strings.removeAds}
                onTouchTap={onRemoveAdTouchTap}
              />
            ) : null}
            {process.env.PLATFORM === 'windows' && shouldShowAd ? (
              <ListItem
                primaryText={strings.restorePurchase}
                secondaryText={strings.restorePurchaseDesc}
                onTouchTap={onRestorePurchaseTouchTap}
              />
            ) : null}
            {process.env.PLATFORM === 'windows' && !shouldShowAd ? (
              <ListItem
                primaryText={strings.removeAds}
                secondaryText={strings.activated}
              />
            ) : null}
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
  shouldShowAd: PropTypes.bool,
  onToggle: PropTypes.func,
  onSettingChange: PropTypes.func,
  onRemoveAdTouchTap: PropTypes.func,
  onRestorePurchaseTouchTap: PropTypes.func,
};

const mapStateToProps = state => ({
  darkMode: state.settings.darkMode,
  primaryColorId: state.settings.primaryColorId,
  preventScreenLock: state.settings.preventScreenLock,
  translateWhenPressingEnter: state.settings.translateWhenPressingEnter,
  realtime: state.settings.realtime,
  chinaMode: state.settings.chinaMode,
  shouldShowAd: state.ad.shouldShowAd,
});

const mapDispatchToProps = dispatch => ({
  onToggle: (name) => {
    dispatch(toggleSetting(name));
  },
  onSettingChange: (name, value) => {
    dispatch(updateSetting(name, value));
  },
  onRemoveAdTouchTap: () => {
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
  onRestorePurchaseTouchTap: () => {
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
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Settings);
