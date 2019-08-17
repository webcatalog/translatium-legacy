import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { closeAlert } from '../../state/root/alert/actions';

import strings from '../../strings/en.json';

const Alert = ({ alertMessage, onClose }) => (
  <Dialog
    open={alertMessage != null}
    onClose={onClose}
  >
    <DialogTitle>{strings.errorOccured}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {strings[alertMessage]}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button color="primary" onClick={onClose}>
        {strings.close}
      </Button>
    </DialogActions>
  </Dialog>
);

Alert.propTypes = {
  alertMessage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  alertMessage: state.alert.message,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(closeAlert()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Alert);
