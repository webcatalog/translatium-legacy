import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

import connectComponent from '../../helpers/connect-component';

import {
  updateForm,
  register,
} from '../../state/root/dialog-license-registration/actions';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

const { remote } = window.require('electron');

const styles = (theme) => ({
  dialogContentText: {
    marginTop: theme.spacing.unit * 2,
  },
  dialogActions: {
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: theme.spacing.unit,
  },
});

const DialogLicenseRegistration = (props) => {
  const {
    classes,
    licenseKey,
    licenseKeyError,
    locale,
    onRegister,
    onUpdateForm,
    open,
  } = props;

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      // onClose={onClose}
      open={open}
    >
      <EnhancedDialogTitle>
        {locale.licenseRegistration}
      </EnhancedDialogTitle>
      <DialogContent>
        <DialogContentText className={classes.dialogContentText}>
          {locale.licenseContentText}
        </DialogContentText>
        <TextField
          fullWidth
          id=""
          label={licenseKeyError || locale.licenseKey}
          margin="normal"
          onChange={(e) => onUpdateForm({ licenseKey: e.target.value })}
          value={licenseKey}
          placeholder="0-0000000000000-00000000-00000000-00000000-00000000"
          error={Boolean(licenseKeyError)}
          variant="outlined"
          helperText={locale.licenseHelper}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <div style={{ flex: 1 }}>
          <Button
            onClick={() => remote.shell.openExternal('https://webcatalog.onfastspring.com/translatiumapp/translatium')}
          >
            {locale.visitStore}
          </Button>
        </div>
        <Button
          color="primary"
          onClick={onRegister}
        >
          {locale.register}
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
  locale: PropTypes.object.isRequired,
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
    locale: state.locale,
  };
};

const actionCreators = {
  updateForm,
  register,
};

export default connectComponent(
  DialogLicenseRegistration,
  mapStateToProps,
  actionCreators,
  styles,
);
