/* global ipcRenderer */
import React from 'react';
import PropTypes from 'prop-types';
import { replace, goBack } from 'react-router-redux';

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

import colorPairs from '../constants/colors';

import getPlatform from '../helpers/get-platform';

import Alert from './root/alert';

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
      primaryColorId,
      onBackClick,
      onUpdateInputText,
      onUpdateInputLang,
    } = this.props;

    this.setAppTitleBar(primaryColorId);

    if (getPlatform() === 'windows') {
      const systemNavigationManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
      systemNavigationManager.onbackrequested = (e) => {
        const { bottomNavigationSelectedIndex } = this.props;
        if (bottomNavigationSelectedIndex < 0) {
          onBackClick();
          /* eslint-disable */
          e.handled = true;
          /* eslint-enable */
        }
      };
    }

    window.addEventListener('resize', this.props.onResize);

    if (getPlatform() === 'electron') {
      ipcRenderer.on('set-input-text', (e, text) => {
        onUpdateInputText(text);
      });

      ipcRenderer.on('set-input-lang', (e, value) => {
        onUpdateInputLang(value);
      });
    }
  }

  componentWillUpdate(nextProps) {
    const { primaryColorId } = this.props;

    if (primaryColorId !== nextProps.primaryColorId) {
      this.setAppTitleBar(nextProps.primaryColorId);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
  }

  setAppTitleBar(primaryColorId) {
    const color = colorPairs[primaryColorId].dark;

    if (getPlatform() === 'windows') {
      /* global Windows */
      const regCode = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      const backgroundColor = {
        r: parseInt(regCode[1], 16),
        g: parseInt(regCode[2], 16),
        b: parseInt(regCode[3], 16),
        a: 1,
      };
      const foregroundColor = {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      };

      // PC
      if (Windows.UI.ViewManagement.ApplicationView) {
        const v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
        v.titleBar.backgroundColor = backgroundColor;
        v.titleBar.foregroundColor = foregroundColor;
        v.titleBar.buttonBackgroundColor = backgroundColor;
        v.titleBar.buttonForegroundColor = foregroundColor;
      }

      if (Windows.UI.ViewManagement.StatusBar) {
        const statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
        statusBar.backgroundColor = backgroundColor;
        statusBar.foregroundColor = foregroundColor;
        statusBar.backgroundOpacity = 1;
        statusBar.showAsync();
      }
    }
  }

  render() {
    const {
      bottomNavigationSelectedIndex,
      children,
      classes,
      fullPageLoading,
      onBottomNavigationActionClick,
      onRequestCloseSnackbar,
      shouldShowBottomNav,
      snackbarMessage,
      snackbarOpen,
      strings,
    } = this.props;

    return (
      <div className={classes.container}>
        {getPlatform() === 'electron' && (
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
          {children}
          {bottomNavigationSelectedIndex > -1 && shouldShowBottomNav && (
            <Paper elevation={2} style={{ zIndex: 1000 }}>
              <BottomNavigation value={bottomNavigationSelectedIndex} showLabels>
                <BottomNavigationAction
                  label={strings.home}
                  icon={<ActionHome className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick('/')}
                />
                <BottomNavigationAction
                  label={strings.phrasebook}
                  icon={<ToggleStar className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick('/phrasebook')}
                />
                <BottomNavigationAction
                  label={strings.settings}
                  icon={<ActionSettings className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick('/settings')}
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
  children: PropTypes.element, // matched child route component
  classes: PropTypes.object.isRequired,
  fullPageLoading: PropTypes.bool,
  onBackClick: PropTypes.func.isRequired,
  onBottomNavigationActionClick: PropTypes.func.isRequired,
  onRequestCloseSnackbar: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  onUpdateInputLang: PropTypes.func.isRequired,
  onUpdateInputText: PropTypes.func.isRequired,
  primaryColorId: PropTypes.string,
  shouldShowBottomNav: PropTypes.bool.isRequired,
  snackbarMessage: PropTypes.string,
  snackbarOpen: PropTypes.bool,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = (state, ownProps) => {
  let bottomNavigationSelectedIndex = -1;
  switch (ownProps.location.pathname) {
    case '/help':
      bottomNavigationSelectedIndex = 3;
      break;
    case '/settings':
      bottomNavigationSelectedIndex = 2;
      break;
    case '/phrasebook':
      bottomNavigationSelectedIndex = 1;
      break;
    case '/':
      bottomNavigationSelectedIndex = 0;
      break;
    default:
      bottomNavigationSelectedIndex = -1;
  }


  return {
    bottomNavigationSelectedIndex,
    fullPageLoading: state.pages.ocr && state.pages.ocr.status === 'loading',
    pathname: ownProps.location.pathname,
    primaryColorId: state.settings.primaryColorId,
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
  onBottomNavigationActionClick: pathname => dispatch(replace(pathname)),
  onBackClick: () => dispatch(goBack()),
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
