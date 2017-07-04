import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Dialog from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import { closeAlert } from '../actions/alert';

const Alert = ({ alertMessage, strings, onClose }) => {
  const actions = [
    <Button
      label="Close"
      primary
      onClick={onClose}
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
