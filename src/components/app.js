/* global ipcRenderer */
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
import { updateImeMode, updateInputText } from '../state/pages/home/actions';
import { closeSnackbar } from '../state/root/snackbar/actions';
import { updateInputLang } from '../state/root/settings/actions';
import { changeRoute } from '../state/root/router/actions';

import Home from './pages/home';
import Phrasebook from './pages/phrasebook';
import Settings from './pages/settings';
import LanguageList from './pages/language-list';
import Ocr from './pages/ocr';

import Alert from './root/alert';
import WindowsTitlebar from './root/windows-titlebar';

import {
  ROUTE_HOME,
  ROUTE_PHRASEBOOK,
  ROUTE_SETTINGS,
  ROUTE_LANGUAGE_LIST_INPUT,
  ROUTE_LANGUAGE_LIST_OUTPUT,
  ROUTE_OCR,
} from '../constants/routes';

const styles = theme => ({
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
    flexBasis: 22,
    height: 22,
    backgroundColor: theme.palette.primary.dark,
    color: '#fff',
    textAlign: 'center',
    fontSize: 13,
    WebkitUserSelect: 'none',
    WebkitAppRegion: 'drag',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  icon: {
    display: 'block',
    margin: 'auto',
  },
});

class App extends React.Component {
  componentDidMount() {
    const {
      onUpdateInputText,
      onUpdateInputLang,
      onResize,
    } = this.props;

    // this.setAppTitleBar(primaryColorId);

    window.addEventListener('resize', onResize);

    ipcRenderer.on('set-input-text', (e, text) => {
      onUpdateInputText(text);
    });

    ipcRenderer.on('set-input-lang', (e, value) => {
      onUpdateInputLang(value);
    });
  }

  componentWillUnmount() {
    const { onResize } = this.props;
    window.removeEventListener('resize', onResize);
  }

  render() {
    const {
      bottomNavigationSelectedIndex,
      classes,
      fullPageLoading,
      onBottomNavigationActionClick,
      onRequestCloseSnackbar,
      route,
      shouldShowBottomNav,
      snackbarMessage,
      snackbarOpen,
      strings,
    } = this.props;

    let routeContent;
    switch (route) {
      case ROUTE_PHRASEBOOK:
        routeContent = <Phrasebook />;
        break;
      case ROUTE_SETTINGS:
        routeContent = <Settings />;
        break;
      case ROUTE_LANGUAGE_LIST_INPUT:
        routeContent = <LanguageList type="inputLang" />;
        break;
      case ROUTE_LANGUAGE_LIST_OUTPUT:
        routeContent = <LanguageList type="outputLang" />;
        break;
      case ROUTE_OCR:
        routeContent = <Ocr />;
        break;
      default:
        routeContent = <Home />;
    }

    return (
      <div className={classes.container}>
        {window.platform === 'darwin' && (
          <div className={classes.fakeTitleBar}>
            Translatium
          </div>
        )}
        {window.platform === 'win32' && <WindowsTitlebar />}
        <div className={classes.contentContainer}>
          {fullPageLoading && (
            <div className={classes.fullPageProgress}>
              <CircularProgress size={80} />
            </div>
          )}
          <Alert />
          <Snackbar
            open={snackbarOpen}
            message={snackbarMessage || ''}
            autoHideDuration={4000}
            onRequestClose={onRequestCloseSnackbar}
            action={(
              <Button color="secondary" size="small" onClick={onRequestCloseSnackbar}>
                {strings.close}
              </Button>
            )}
          />
          {routeContent}
          {bottomNavigationSelectedIndex > -1 && shouldShowBottomNav && (
            <Paper elevation={2} style={{ zIndex: 1000 }}>
              <BottomNavigation value={bottomNavigationSelectedIndex} showLabels>
                <BottomNavigationAction
                  label={strings.home}
                  icon={<ActionHome className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick(ROUTE_HOME)}
                />
                <BottomNavigationAction
                  label={strings.phrasebook}
                  icon={<ToggleStar className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick(ROUTE_PHRASEBOOK)}
                />
                <BottomNavigationAction
                  label={strings.settings}
                  icon={<ActionSettings className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick(ROUTE_SETTINGS)}
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
  bottomNavigationSelectedIndex: PropTypes.number,
  classes: PropTypes.object.isRequired,
  fullPageLoading: PropTypes.bool,
  onBottomNavigationActionClick: PropTypes.func.isRequired,
  onRequestCloseSnackbar: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  onUpdateInputLang: PropTypes.func.isRequired,
  onUpdateInputText: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  shouldShowBottomNav: PropTypes.bool.isRequired,
  snackbarMessage: PropTypes.string,
  snackbarOpen: PropTypes.bool,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = (state) => {
  let bottomNavigationSelectedIndex = -1;
  switch (state.router.route) {
    case ROUTE_SETTINGS:
      bottomNavigationSelectedIndex = 2;
      break;
    case ROUTE_PHRASEBOOK:
      bottomNavigationSelectedIndex = 1;
      break;
    case ROUTE_HOME:
      bottomNavigationSelectedIndex = 0;
      break;
    default:
      bottomNavigationSelectedIndex = -1;
  }


  return {
    bottomNavigationSelectedIndex,
    fullPageLoading: state.pages.ocr && state.pages.ocr.status === 'loading',
    primaryColorId: state.settings.primaryColorId,
    route: state.router.route,
    shouldShowBottomNav: !(state.pages.home.imeMode === 'handwriting' || state.pages.home.imeMode === 'speech'),
    snackbarMessage: state.snackbar.message,
    snackbarOpen: state.snackbar.open,
    strings: state.strings,
  };
};

const mapDispatchToProps = dispatch => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
    dispatch(updateImeMode(null));
  },
  onBottomNavigationActionClick: pathname => dispatch(changeRoute(pathname)),
  onRequestCloseSnackbar: () => dispatch(closeSnackbar()),
  onUpdateInputText: (inputText) => {
    dispatch(updateInputText(inputText, 0, 0));
  },
  onUpdateInputLang: (value) => {
    dispatch(updateInputLang(value));
  },
});

export default connectComponent(
  App,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
