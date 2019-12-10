import React from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import ActionHome from '@material-ui/icons/Home';
import ActionSettings from '@material-ui/icons/Settings';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import ToggleStar from '@material-ui/icons/Star';

import connectComponent from '../helpers/connect-component';

import { screenResize } from '../state/root/screen/actions';
import { closeSnackbar } from '../state/root/snackbar/actions';
import { changeRoute } from '../state/root/router/actions';
import { open as openDialogLicenseRegistration } from '../state/root/dialog-license-registration/actions';

import Alert from './root/alert';
import DialogLicenseRegistration from './root/dialog-license-registration';

import Home from './pages/home';
import Phrasebook from './pages/phrasebook';
import Preferences from './pages/preferences';
import LanguageList from './pages/language-list';
import Ocr from './pages/ocr';

import {
  ROUTE_HOME,
  ROUTE_PHRASEBOOK,
  ROUTE_PREFERENCES,
  ROUTE_LANGUAGE_LIST,
  ROUTE_OCR,
} from '../constants/routes';

const styles = (theme) => ({
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
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.dark,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
    height: 22,
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
    textAlign: 'center',
    lineHeight: '22px',
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
  bottomNavigation: {
    height: 40,
  },
  bottomNavigationActionWrapper: {
    flexDirection: 'row',
  },
  bottomNavigationActionLabel: {
    fontSize: '0.8rem !important',
    paddingLeft: 4,
  },
});

class App extends React.Component {
  componentDidMount() {
    const { registered, onOpenDialogLicenseRegistration } = this.props;
    if (!registered) {
      onOpenDialogLicenseRegistration();
    }
  }

  componentWillUnmount() {
    const { onResize } = this.props;
    window.removeEventListener('resize', onResize);
  }

  render() {
    const {
      attachToMenubar,
      classes,
      fullPageLoading,
      locale,
      onBottomNavigationActionClick,
      onRequestCloseSnackbar,
      route,
      shouldShowBottomNav,
      snackbarMessage,
      snackbarOpen,
    } = this.props;

    const renderRoute = () => {
      switch (route) {
        case ROUTE_PREFERENCES:
          return <Preferences key="preferences" />;
        case ROUTE_PHRASEBOOK:
          return <Phrasebook key="installed" />;
        case ROUTE_LANGUAGE_LIST:
          return <LanguageList key="language-list" />;
        case ROUTE_OCR:
          return <Ocr key="ocr" />;
        default:
          return <Home key="home" />;
      }
    };

    const bottomNavigationSelectedIndex = (() => {
      switch (route) {
        case ROUTE_PREFERENCES:
          return 2;
        case ROUTE_PHRASEBOOK:
          return 1;
        case ROUTE_HOME:
          return 0;
        default:
          return -1;
      }
    })();

    return (
      <div className={classes.container}>
        {window.process.platform === 'darwin' && !attachToMenubar && (
          <div className={classes.fakeTitleBar}>
            Translatium
          </div>
        )}
        <div className={classes.contentContainer}>
          {fullPageLoading && (
            <div className={classes.fullPageProgress}>
              <CircularProgress size={80} />
            </div>
          )}
          <Alert />
          <DialogLicenseRegistration />
          <Snackbar
            open={snackbarOpen}
            message={snackbarMessage || ''}
            autoHideDuration={4000}
            onClose={onRequestCloseSnackbar}
            action={(
              <Button color="secondary" size="small" onClick={onRequestCloseSnackbar}>
                {locale.close}
              </Button>
            )}
          />
          {renderRoute()}
          {bottomNavigationSelectedIndex > -1 && shouldShowBottomNav && (
            <Paper elevation={2} style={{ zIndex: 1000 }}>
              <BottomNavigation
                value={bottomNavigationSelectedIndex}
                classes={{ root: classes.bottomNavigation }}
                showLabels
              >
                <BottomNavigationAction
                  label={locale.home}
                  icon={<ActionHome className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick(ROUTE_HOME)}
                  classes={{
                    wrapper: classes.bottomNavigationActionWrapper,
                    label: classes.bottomNavigationActionLabel,
                  }}
                />
                <BottomNavigationAction
                  label={locale.phrasebook}
                  icon={<ToggleStar className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick(ROUTE_PHRASEBOOK)}
                  classes={{
                    wrapper: classes.bottomNavigationActionWrapper,
                    label: classes.bottomNavigationActionLabel,
                  }}
                />
                <BottomNavigationAction
                  label={locale.preferences}
                  icon={<ActionSettings className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick(ROUTE_PREFERENCES)}
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

App.propTypes = {
  attachToMenubar: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  fullPageLoading: PropTypes.bool.isRequired,
  locale: PropTypes.object.isRequired,
  onBottomNavigationActionClick: PropTypes.func.isRequired,
  onOpenDialogLicenseRegistration: PropTypes.func.isRequired,
  onRequestCloseSnackbar: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  registered: PropTypes.bool.isRequired,
  route: PropTypes.string.isRequired,
  shouldShowBottomNav: PropTypes.bool.isRequired,
  snackbarMessage: PropTypes.string,
  snackbarOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  attachToMenubar: state.preferences.attachToMenubar,
  fullPageLoading: Boolean(state.pages.ocr && state.pages.ocr.status === 'loading'),
  locale: state.locale,
  registered: state.preferences.registered,
  route: state.router.route,
  shouldShowBottomNav: true,
  snackbarMessage: state.snackbar.message,
  snackbarOpen: state.snackbar.open,
});

const mapDispatchToProps = (dispatch) => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
  },
  onBottomNavigationActionClick: (pathname) => dispatch(changeRoute(pathname)),
  onRequestCloseSnackbar: () => dispatch(closeSnackbar()),
  onOpenDialogLicenseRegistration: () => dispatch(openDialogLicenseRegistration()),
});

export default connectComponent(
  App,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
