/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { getCurrentWindow, systemPreferences, getGlobal } from '@electron/remote';

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

import getLocale from '../helpers/get-locale';

import { closeSnackbar } from '../state/root/snackbar/actions';
import { changeRoute } from '../state/root/router/actions';

import WindowsTitleBar from './shared/windows-title-bar';

import Alert from './root/alert';
import DialogAbout from './root/dialog-about';
import DialogOpenSourceNotices from './root/dialog-open-source-notices';

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

const useStyles = makeStyles((theme) => {
  // big sur increases title bar height
  const titleBarHeight = getGlobal('isMacOs11') ? 28 : 22;

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
      overflow: 'hidden',
      whiteSpace: 'nowrap',
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
});

const App = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const fullPageLoading = useSelector(
    (state) => Boolean(state.pages.ocr && state.pages.ocr.status === 'loading'),
  );
  const isFullScreen = useSelector((state) => state.general.isFullScreen);
  const route = useSelector((state) => state.router.route);
  const snackbarMessage = useSelector((state) => state.snackbar.message);
  const snackbarOpen = useSelector((state) => state.snackbar.open);

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
            // https://github.com/webcatalog/webcatalog-app/issues/656

            // User can choose title bar behavior from macOS System Preferences > Dock & Menu Bar
            const systemPref = systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');

            switch (systemPref) {
              case 'Minimize': {
                const win = getCurrentWindow();
                win.minimize();
                break;
              }
              case 'Maximize': {
                const win = getCurrentWindow();
                if (win.isMaximized()) {
                  win.unmaximize();
                } else {
                  win.maximize();
                }
                break;
              }
              default: break;
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
        <DialogOpenSourceNotices />
        <Snackbar
          open={snackbarOpen}
          message={snackbarMessage || ''}
          autoHideDuration={4000}
          onClose={() => dispatch(closeSnackbar())}
          action={(
            <Button color="secondary" size="small" onClick={() => dispatch(closeSnackbar())}>
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
        {bottomNavigationSelectedIndex > -1 && (
          <Paper elevation={1} style={{ zIndex: 1000 }}>
            <BottomNavigation
              value={bottomNavigationSelectedIndex}
              classes={{ root: classes.bottomNavigation }}
              showLabels
            >
              <BottomNavigationAction
                label={getLocale('home')}
                icon={<HomeIcon className={classes.icon} />}
                onClick={() => dispatch(changeRoute(ROUTE_HOME))}
                classes={{
                  wrapper: classes.bottomNavigationActionWrapper,
                  label: classes.bottomNavigationActionLabel,
                }}
              />
              <BottomNavigationAction
                label={getLocale('history')}
                icon={<HistoryIcon className={classes.icon} />}
                onClick={() => dispatch(changeRoute(ROUTE_HISTORY))}
                classes={{
                  wrapper: classes.bottomNavigationActionWrapper,
                  label: classes.bottomNavigationActionLabel,
                }}
              />
              <BottomNavigationAction
                label={getLocale('phrasebook')}
                icon={<StarIcon className={classes.icon} />}
                onClick={() => dispatch(changeRoute(ROUTE_PHRASEBOOK))}
                classes={{
                  wrapper: classes.bottomNavigationActionWrapper,
                  label: classes.bottomNavigationActionLabel,
                }}
              />
              <BottomNavigationAction
                label={getLocale('preferences')}
                icon={<SettingsIcon className={classes.icon} />}
                onClick={() => dispatch(changeRoute(ROUTE_PREFERENCES))}
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
};

export default App;
