/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { closeAlert } from '../../state/root/alert/actions';

import connectComponent from '../../helpers/connect-component';
import getLocale from '../../helpers/get-locale';

const Alert = ({ alertMessage, onCloseAlert }) => (
  <Dialog
    open={alertMessage != null}
    onClose={onCloseAlert}
  >
    <DialogTitle>{getLocale('errorOccured')}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {alertMessage != null ? getLocale(alertMessage) : null}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button color="primary" onClick={onCloseAlert}>
        {getLocale('close')}
      </Button>
    </DialogActions>
  </Dialog>
);

Alert.defaultProps = {
  alertMessage: null,
};

Alert.propTypes = {
  alertMessage: PropTypes.string,
  onCloseAlert: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  alertMessage: state.alert.message,
});

const actionCreators = {
  closeAlert,
};

export default connectComponent(
  Alert,
  mapStateToProps,
  actionCreators,
  null,
);
