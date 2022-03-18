/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import { useSelector } from 'react-redux';

import { ThemeProvider as MuiThemeProvider, createTheme, withStyles } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/pink';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';

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

const AppWrapper = () => {
  const shouldUseDarkColors = useSelector((state) => state.general.shouldUseDarkColors);

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

  const theme = createTheme(themeObj);

  return (
    <MuiThemeProvider theme={theme}>
      <GlobalCss />
      <App />
    </MuiThemeProvider>
  );
};

export default AppWrapper;
