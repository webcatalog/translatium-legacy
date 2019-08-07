const { OPEN_SNACKBAR, CLOSE_SNACKBAR } = require('../../../constants/actions');

export const openSnackbar = message => ({
  type: OPEN_SNACKBAR,
  message,
});

export const closeSnackbar = () => ({
  type: CLOSE_SNACKBAR,
});
