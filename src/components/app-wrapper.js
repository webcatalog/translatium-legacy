/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import { ThemeProvider as MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/pink';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';

import connectComponent from '../helpers/connect-component';

import App from './app';

const GlobalCss = withStyles({
  // @global is handled by jss-plugin-global.
  // overwite material-ui styles
  '@global': {
    '.MuiTooltip-tooltipPlacementLeft': {
      margin: '0 8px',
    },
    '.MuiTooltip-tooltipPlacementRight': {
      margin: '0 8px',
    },
    '.MuiTooltip-tooltipPlacementTop': {
      margin: '8px 0',
    },
    '.MuiTooltip-tooltipPlacementBottom': {
      margin: '8px 0',
    },
  },
})(() => null);

const AppWrapper = ({ shouldUseDarkColors }) => {
  const themeObj = {
    typography: {
      fontSize: 13.5,
    },
    palette: {
      type: shouldUseDarkColors ? 'dark' : 'light',
      primary: {
        light: green[300],
        main: green[600],
        dark: green[800],
      },
      secondary: {
        light: pink[300],
        main: pink[500],
        dark: pink[900],
      },
      error: {
        light: red[300],
        main: red[500],
        dark: red[700],
      },
    },
  };

  if (!shouldUseDarkColors) {
    themeObj.background = {
      primary: grey[200],
    };
  }

  const theme = createMuiTheme(themeObj);

  return (
    <MuiThemeProvider theme={theme}>
      <GlobalCss />
      <App />
    </MuiThemeProvider>
  );
};

AppWrapper.propTypes = {
  shouldUseDarkColors: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  shouldUseDarkColors: state.general.shouldUseDarkColors,
});

export default connectComponent(
  AppWrapper,
  mapStateToProps,
  null,
  null,
);
