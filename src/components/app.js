/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import CircularProgress from '@material-ui/core/CircularProgress';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';

import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import StarIcon from '@material-ui/icons/Star';
import HistoryIcon from '@material-ui/icons/History';

import connectComponent from '../helpers/connect-component';
import getLocale from '../helpers/get-locale';

import { screenResize } from '../state/root/screen/actions';
import { closeSnackbar } from '../state/root/snackbar/actions';
import { changeRoute } from '../state/root/router/actions';

import WindowsTitleBar from './shared/windows-title-bar';

import Alert from './root/alert';
import DialogAbout from './root/dialog-about';

import Home from './pages/home';
import History from './pages/history';
import Phrasebook from './pages/phrasebook';
import Preferences from './pages/preferences';
import LanguageList from './pages/language-list';
import Ocr from './pages/ocr';

import {
  ROUTE_HOME,
  ROUTE_HISTORY,
  ROUTE_PHRASEBOOK,
  ROUTE_PREFERENCES,
  ROUTE_LANGUAGE_LIST,
  ROUTE_OCR,
} from '../constants/routes';

const styles = (theme) => {
  // big sur increases title bar height
  const { remote } = window.require('electron');
  const titleBarHeight = remote.getGlobal('isMacOs11') ? 28 : 22;

  return {
    container: {
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.default,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    },
    fullPageProgress: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100vh',
      width: '100vw',
      zIndex: 10000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fakeTitleBar: {
      background: theme.palette.type === 'dark' ? theme.palette.common.black : theme.palette.primary.dark,
      color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.common.black) : theme.palette.primary.contrastText,
      height: titleBarHeight,
      WebkitAppRegion: 'drag',
      WebkitUserSelect: 'none',
      textAlign: 'center',
      lineHeight: `${titleBarHeight}px`,
      fontSize: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    },
    contentContainer: {
      flex: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    bottomNavigationActionLabel: {
      fontSize: '0.8rem !important',
    },
    hidden: {
      display: 'none !important',
    },
    preloadedRouteContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
  };
};

class App extends React.Component {
  componentWillUnmount() {
    const { onScreenResize } = this.props;
    window.removeEventListener('resize', () => onScreenResize(window.innerWidth));
  }

  render() {
    const {
      classes,
      fullPageLoading,
      isFullScreen,
      onChangeRoute,
      onCloseSnackbar,
      route,
      shouldShowBottomNav,
      snackbarMessage,
      snackbarOpen,
    } = this.props;

    const renderRoute = () => {
      switch (route) {
        case ROUTE_PREFERENCES:
          return <Preferences key="preferences" />;
        case ROUTE_HISTORY:
          return <History key="history" />;
        case ROUTE_PHRASEBOOK:
          return <Phrasebook key="phrasebook" />;
        case ROUTE_LANGUAGE_LIST:
          return null; // already preloaded
        case ROUTE_OCR:
          return <Ocr key="ocr" />;
        default:
          return null; // already preloaded
      }
    };

    const bottomNavigationSelectedIndex = (() => {
      switch (route) {
        case ROUTE_PREFERENCES:
          return 3;
        case ROUTE_PHRASEBOOK:
          return 2;
        case ROUTE_HISTORY:
          return 1;
        case ROUTE_HOME:
          return 0;
        default:
          return -1;
      }
    })();

    return (
      <div className={classes.container}>
        {window.process.platform === 'darwin' && !isFullScreen && window.mode !== 'menubar' && (
          <div
            className={classes.fakeTitleBar}
            onDoubleClick={() => {
              // feature: double click on title bar to expand #656
              // https://github.com/atomery/webcatalog/issues/656
              const win = window.require('electron').remote.getCurrentWindow();
              if (win.isMaximized()) {
                win.unmaximize();
              } else {
                win.maximize();
              }
            }}
          />
        )}
        {window.process.platform !== 'darwin' && (
          <WindowsTitleBar title="Translatium" />
        )}
        <div className={classes.contentContainer}>
          {fullPageLoading && (
            <div className={classes.fullPageProgress}>
              <CircularProgress size={80} />
            </div>
          )}
          <Alert />
          <DialogAbout />
          <Snackbar
            open={snackbarOpen}
            message={snackbarMessage || ''}
            autoHideDuration={4000}
            onClose={onCloseSnackbar}
            action={(
              <Button color="secondary" size="small" onClick={onCloseSnackbar}>
                {getLocale('close')}
              </Button>
            )}
          />
          {renderRoute()}
          <div
            className={classNames(
              classes.preloadedRouteContainer,
              route !== ROUTE_HOME && classes.hidden,
            )}
          >
            <Home key="language-list" />
          </div>
          <div
            className={classNames(
              classes.preloadedRouteContainer,
              route !== ROUTE_LANGUAGE_LIST && classes.hidden,
            )}
          >
            <LanguageList key="language-list" />
          </div>
          {bottomNavigationSelectedIndex > -1 && shouldShowBottomNav && (
            <Paper elevation={1} style={{ zIndex: 1000 }}>
              <BottomNavigation
                value={bottomNavigationSelectedIndex}
                classes={{ root: classes.bottomNavigation }}
                showLabels
              >
                <BottomNavigationAction
                  label={getLocale('home')}
                  icon={<HomeIcon className={classes.icon} />}
                  onClick={() => onChangeRoute(ROUTE_HOME)}
                  classes={{
                    wrapper: classes.bottomNavigationActionWrapper,
                    label: classes.bottomNavigationActionLabel,
                  }}
                />
                <BottomNavigationAction
                  label={getLocale('history')}
                  icon={<HistoryIcon className={classes.icon} />}
                  onClick={() => onChangeRoute(ROUTE_HISTORY)}
                  classes={{
                    wrapper: classes.bottomNavigationActionWrapper,
                    label: classes.bottomNavigationActionLabel,
                  }}
                />
                <BottomNavigationAction
                  label={getLocale('phrasebook')}
                  icon={<StarIcon className={classes.icon} />}
                  onClick={() => onChangeRoute(ROUTE_PHRASEBOOK)}
                  classes={{
                    wrapper: classes.bottomNavigationActionWrapper,
                    label: classes.bottomNavigationActionLabel,
                  }}
                />
                <BottomNavigationAction
                  label={getLocale('preferences')}
                  icon={<SettingsIcon className={classes.icon} />}
                  onClick={() => onChangeRoute(ROUTE_PREFERENCES)}
                  classes={{
                    wrapper: classes.bottomNavigationActionWrapper,
                    label: classes.bottomNavigationActionLabel,
                  }}
                />
              </BottomNavigation>
            </Paper>
          )}
        </div>
      </div>
    );
  }
}

App.defaultProps = {
  snackbarMessage: null,
};

App.propTypes = {
  classes: PropTypes.object.isRequired,
  fullPageLoading: PropTypes.bool.isRequired,
  isFullScreen: PropTypes.bool.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  onCloseSnackbar: PropTypes.func.isRequired,
  onScreenResize: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  shouldShowBottomNav: PropTypes.bool.isRequired,
  snackbarMessage: PropTypes.string,
  snackbarOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  fullPageLoading: Boolean(state.pages.ocr && state.pages.ocr.status === 'loading'),
  isFullScreen: state.general.isFullScreen,
  route: state.router.route,
  shouldShowBottomNav: true,
  snackbarMessage: state.snackbar.message,
  snackbarOpen: state.snackbar.open,
});

const actionCreators = {
  screenResize,
  changeRoute,
  closeSnackbar,
};

export default connectComponent(
  App,
  mapStateToProps,
  actionCreators,
  styles,
);
