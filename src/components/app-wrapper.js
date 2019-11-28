import React from 'react';
import PropTypes from 'prop-types';

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import pink from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/pink';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';

import connectComponent from '../helpers/connect-component';

import { updateIsDarkMode, updateIsFullScreen } from '../state/root/general/actions';
import { getShouldUseDarkMode } from '../state/root/general/utils';

import App from './app';

const { remote } = window.require('electron');

class AppWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.handleEnterFullScreen = this.handleEnterFullScreen.bind(this);
    this.handleLeaveFullScreen = this.handleLeaveFullScreen.bind(this);
    this.handleChangeTheme = this.handleChangeTheme.bind(this);
  }

  componentDidMount() {
    remote.getCurrentWindow().on('enter-full-screen', this.handleEnterFullScreen);
    remote.getCurrentWindow().on('leave-full-screen', this.handleLeaveFullScreen);

    if (window.process.platform === 'darwin') {
      this.appleInterfaceThemeChangedNotificationId = remote.systemPreferences
        .subscribeNotification(
          'AppleInterfaceThemeChangedNotification',
          this.handleChangeTheme,
        );
    }
  }

  componentWillUnmount() {
    remote.getCurrentWindow().removeListener('enter-full-screen', this.handleEnterFullScreen);
    remote.getCurrentWindow().removeListener('leave-full-screen', this.handleLeaveFullScreen);

    if (window.process.platform === 'darwin') {
      remote.systemPreferences.unsubscribeNotification(
        this.appleInterfaceThemeChangedNotificationId,
      );
    }
  }

  handleEnterFullScreen() {
    const { onUpdateIsFullScreen } = this.props;
    onUpdateIsFullScreen(true);
  }

  handleLeaveFullScreen() {
    const { onUpdateIsFullScreen } = this.props;
    onUpdateIsFullScreen(false);
  }

  handleChangeTheme() {
    const { onUpdateIsDarkMode } = this.props;
    onUpdateIsDarkMode(remote.systemPreferences.isDarkMode());
  }

  render() {
    const {
      children,
      location,
      shouldUseDarkMode,
    } = this.props;

    const themeObj = {
      palette: {
        type: shouldUseDarkMode ? 'dark' : 'light',
        primary: {
          light: green[300],
          main: green[600],
          dark: green[700],
        },
        secondary: {
          light: pink[300],
          main: pink[500],
          dark: pink[700],
        },
        error: {
          light: red[300],
          main: red[500],
          dark: red[700],
        },
      },
    };

    if (!shouldUseDarkMode) {
      themeObj.background = {
        primary: grey[200],
      };
    }

    const theme = createMuiTheme(themeObj);

    return (
      <MuiThemeProvider theme={theme}>
        <App location={location}>
          {children}
        </App>
      </MuiThemeProvider>
    );
  }
}

AppWrapper.propTypes = {
  children: PropTypes.element.isRequired, // matched child route component
  location: PropTypes.object.isRequired,
  onUpdateIsDarkMode: PropTypes.func.isRequired,
  onUpdateIsFullScreen: PropTypes.func.isRequired,
  shouldUseDarkMode: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  shouldUseDarkMode: getShouldUseDarkMode(state),
});

const mapDispatchToProps = (dispatch) => ({
  onUpdateIsDarkMode: (...args) => dispatch(updateIsDarkMode(...args)),
  onUpdateIsFullScreen: (...args) => dispatch(updateIsFullScreen(...args)),
});

export default connectComponent(
  AppWrapper,
  mapStateToProps,
  mapDispatchToProps,
  null,
);
