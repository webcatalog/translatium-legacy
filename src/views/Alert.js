import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import { closeAlert } from '../actions/alert';

const Alert = ({ alertMessage, strings, onClose }) => (
  <Dialog
    open={alertMessage != null}
    onRequestClose={onClose}
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
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  alertMessage: state.alert.message,
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeAlert()),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Alert);
