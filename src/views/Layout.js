import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { replace, goBack } from 'react-router-redux';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/palette';

import { blue, red, pink, fullWhite, fullBlack } from 'material-ui/styles/colors';
import BottomNavigation, { BottomNavigationButton } from 'material-ui/BottomNavigation';
import { CircularProgress } from 'material-ui/Progress';
import ActionHome from 'material-ui-icons/Home';
import ActionSettings from 'material-ui-icons/Settings';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import ToggleStar from 'material-ui-icons/Star';

import { screenResize } from '../actions/screen';
import { updateImeMode } from '../actions/home';
import { closeSnackbar } from '../actions/snackbar';

import colorPairs from '../constants/colorPairs';

import getPlatform from '../libs/getPlatform';

import Alert from './Alert';
import Ad from './Ad';

/* global window */

class App extends React.Component {
  componentDidMount() {
    if (getPlatform() === 'windows') {
      this.setAppTitleBar(this.props.primaryColorId);

      const { onBackClick } = this.props;

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
  }

  componentWillUpdate(nextProps) {
    const { primaryColorId } = this.props;

    if (primaryColorId !== nextProps.primaryColorId) {
      if (getPlatform() === 'windows') {
        this.setAppTitleBar(nextProps.primaryColorId);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
  }

  setAppTitleBar(primaryColorId) {
    /* global Windows */

    const color = colorPairs[primaryColorId];
    const regCode = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.primary2Color);
    const backgroundColor = {
      r: parseInt(regCode[1], 16),
      g: parseInt(regCode[2], 16),
      b: parseInt(regCode[3], 16),
      a: 1,
    };
    const foregroundColor = { r: 255, g: 255, b: 255, a: 1 };

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

  getStyles() {
    const { darkMode, primaryColorId } = this.props;
    const { primary2Color } = colorPairs[primaryColorId];

    return {
      container: {
        overflow: 'hidden',
        backgroundColor: darkMode ? fullBlack : fullWhite,
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
        backgroundColor: primary2Color,
        color: fullWhite,
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
    };
  }

  render() {
    const {
      children,
      bottomNavigationSelectedIndex,
      fullPageLoading,
      snackbarOpen,
      snackbarMessage,
      shouldShowAd,
      shouldShowBottomNav,
      strings,
      onRequestCloseSnackbar,
      onBottomNavigationButtonClick,
    } = this.props;
    const styles = this.getStyles();

    const theme = createMuiTheme({
      palette: createPalette({
        primary: blue, // Purple and green play nicely together.
        accent: pink,
        error: red,
      }),
    });

    return (
      <MuiThemeProvider theme={theme}>
        <div className="fs" style={styles.container}>
          {getPlatform() === 'mac' ? (
            <div style={styles.fakeTitleBar}>
              Modern Translator
            </div>
          ) : null}
          <div style={styles.contentContainer}>
            {fullPageLoading ? (<div style={styles.fullPageProgress}>
              <CircularProgress size={80} thickness={5} />
            </div>) : null}
            <Alert />
            <Snackbar
              open={snackbarOpen}
              message={snackbarMessage || ''}
              autoHideDuration={4000}
              onRequestClose={() => onRequestCloseSnackbar()}
            />
            {children}
            {bottomNavigationSelectedIndex > -1 && shouldShowBottomNav ? (
              <Paper zDepth={2} style={{ zIndex: 1000 }}>
                <BottomNavigation index={bottomNavigationSelectedIndex} showLabels>
                  <BottomNavigationButton
                    label={strings.home}
                    icon={<ActionHome />}
                    onClick={() => onBottomNavigationButtonClick('/')}
                  />
                  <BottomNavigationButton
                    label={strings.phrasebook}
                    icon={<ToggleStar />}
                    onClick={() => onBottomNavigationButtonClick('/phrasebook')}
                  />
                  <BottomNavigationButton
                    label={strings.settings}
                    icon={<ActionSettings />}
                    onClick={() => onBottomNavigationButtonClick('/settings')}
                  />
                </BottomNavigation>
              </Paper>
            ) : null}
            {getPlatform() === 'windows' && shouldShowAd ? <Ad /> : null}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  children: PropTypes.element, // matched child route component
  darkMode: PropTypes.bool,
  primaryColorId: PropTypes.string,
  fullPageLoading: PropTypes.bool,
  bottomNavigationSelectedIndex: PropTypes.number,
  snackbarOpen: PropTypes.bool,
  snackbarMessage: PropTypes.string,
  shouldShowAd: PropTypes.bool,
  shouldShowBottomNav: PropTypes.bool.isRequired,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onResize: PropTypes.func.isRequired,
  onBottomNavigationButtonClick: PropTypes.func.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onRequestCloseSnackbar: PropTypes.func.isRequired,
};

App.childContextTypes = {
  muiTheme: PropTypes.object,
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
    pathname: ownProps.location.pathname,
    fullPageLoading: state.ocr && state.ocr.status === 'loading',
    darkMode: state.settings.darkMode,
    primaryColorId: state.settings.primaryColorId,
    bottomNavigationSelectedIndex,
    snackbarOpen: state.snackbar.open,
    snackbarMessage: state.snackbar.message,
    shouldShowAd: state.ad.shouldShowAd,
    shouldShowBottomNav: !(state.home.imeMode === 'handwriting' || state.home.imeMode === 'speech'),
    strings: state.strings,
  };
};

const mapDispatchToProps = dispatch => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
    dispatch(updateImeMode(null));
  },
  onBottomNavigationButtonClick: pathname => dispatch(replace(pathname)),
  onBackClick: () => dispatch(goBack()),
  onRequestCloseSnackbar: () => dispatch(closeSnackbar()),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(App);
