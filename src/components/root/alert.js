/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { closeAlert } from '../../state/root/alert/actions';

import getLocale from '../../helpers/get-locale';

const Alert = () => {
  const dispatch = useDispatch();

  const alertMessage = useSelector((state) => state.alert.message);

  return (
    <Dialog
      open={alertMessage != null}
      onClose={() => dispatch(closeAlert())}
    >
      <DialogTitle>{getLocale('errorOccured')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {alertMessage != null ? getLocale(alertMessage) : null}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={dispatch(closeAlert())}>
          {getLocale('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Alert;
