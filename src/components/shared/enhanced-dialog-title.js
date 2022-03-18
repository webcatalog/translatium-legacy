/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import getLocale from '../../helpers/get-locale';

const useStyles = makeStyles((theme) => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: theme.spacing(1, 2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

const EnhancedDialogTitle = ({
  children, onClose,
}) => {
  const classes = useStyles();
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton size="small" aria-label={getLocale('close')} className={classes.closeButton} onClick={onClose}>
          <CloseIcon size="small" />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

EnhancedDialogTitle.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EnhancedDialogTitle;
