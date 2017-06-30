/* global strings */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import { closeAlert } from '../actions/alert';

const Alert = ({ alertMessage, onClose }) => {
  const actions = [
    <FlatButton
      label="Close"
      primary
      onTouchTap={onClose}
    />,
  ];

  return (
    <Dialog
      title={strings.errorOccured}
      actions={actions}
      modal={false}
      open={alertMessage != null}
      onRequestClose={onClose}
    >
      {strings[alertMessage]}
    </Dialog>
  );
};

Alert.propTypes = {
  alertMessage: PropTypes.string,
  onClose: PropTypes.func,
};

const mapStateToProps = state => ({
  alertMessage: state.alert.message,
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeAlert()),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Alert);
