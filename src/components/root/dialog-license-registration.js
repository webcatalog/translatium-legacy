import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

import Countdown from 'react-countdown';

import connectComponent from '../../helpers/connect-component';
import getLocale from '../../helpers/get-locale';

import {
  close,
  updateForm,
  register,
} from '../../state/root/dialog-license-registration/actions';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

import getTrialExpirationTime from '../../helpers/get-trial-expiration-time';

const styles = (theme) => ({
  dialogContentText: {
    marginTop: theme.spacing(2),
  },
  dialogActions: {
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: theme.spacing(1),
  },
});

const DialogLicenseRegistration = (props) => {
  const {
    classes,
    licenseKey,
    licenseKeyError,
    onClose,
    onRegister,
    onUpdateForm,
    open,
  } = props;

  const [trialExpired, setTrialExpired] = useState(false);

  const { remote } = window.require('electron');

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={trialExpired ? null : onClose}
      open={open}
    >
      <EnhancedDialogTitle onClose={trialExpired ? null : onClose}>
        {getLocale('licenseRegistration')}
      </EnhancedDialogTitle>
      <DialogContent>
        <DialogContentText className={classes.dialogContentText}>
          <Countdown
            date={getTrialExpirationTime()}
            renderer={({
              hours, minutes, seconds, completed,
            }) => {
              if (completed) {
                // Render a completed state
                return getLocale('trialExpired');
              }
              // Render a countdown
              // eslint-disable-next-line react/jsx-one-expression-per-line
              return getLocale('trialExpireIn').replace('{time}', `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }}
            onComplete={() => {
              setTrialExpired(true);
            }}
            onMount={({ completed }) => {
              setTrialExpired(completed);
            }}
          />
          &nbsp;
          {getLocale('licenseContentText')}
        </DialogContentText>
        <TextField
          fullWidth
          id=""
          label={licenseKeyError || getLocale('licenseKey')}
          margin="normal"
          onChange={(e) => onUpdateForm({ licenseKey: e.target.value })}
          value={licenseKey}
          placeholder="0-0000000000000-00000000-00000000-00000000-00000000"
          error={Boolean(licenseKeyError)}
          variant="outlined"
          helperText={getLocale('licenseHelper')}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <div style={{ flex: 1 }}>
          <Button
            onClick={() => remote.shell.openExternal('https://webcatalog.onfastspring.com/translatiumapp/translatium?utm_source=translatium_app')}
          >
            {getLocale('visitStore')}
          </Button>
        </div>
        <Button
          color="primary"
          onClick={onRegister}
        >
          {getLocale('register')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogLicenseRegistration.defaultProps = {
  licenseKey: '',
  licenseKeyError: null,
};

DialogLicenseRegistration.propTypes = {
  classes: PropTypes.object.isRequired,
  licenseKey: PropTypes.string,
  licenseKeyError: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const {
    open,
    form: {
      licenseKey,
      licenseKeyError,
    },
  } = state.dialogLicenseRegistration;

  return {
    licenseKey,
    licenseKeyError,
    open,
  };
};

const actionCreators = {
  close,
  updateForm,
  register,
};

export default connectComponent(
  DialogLicenseRegistration,
  mapStateToProps,
  actionCreators,
  styles,
);
