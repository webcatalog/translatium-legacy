import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import connectComponent from '../../helpers/connect-component';
import getLocale from '../../helpers/get-locale';

import { close } from '../../state/root/dialog-about/actions';
import iconPng from '../../assets/icon.png';

import { requestOpenInBrowser } from '../../senders';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

const styles = (theme) => ({
  icon: {
    height: 96,
    width: 96,
  },
  dialogContent: {
    minWidth: 320,
    textAlign: 'center',
  },
  title: {
    display: 'block',
    fontWeight: '600',
    marginTop: theme.spacing(1),
  },
  version: {
    marginBottom: theme.spacing(2),
  },
  versionSmallContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  versionSmall: {
    fontSize: 13,
  },
  goToTheWebsiteButton: {
    marginRight: theme.spacing(1),
  },
  madeBy: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  link: {
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

/* eslint-disable react/jsx-props-no-spreading */
const Transition = (props) => <Slide direction="left" {...props} />;
/* eslint-enable react/jsx-props-no-spreading */

const About = (props) => {
  const {
    classes,
    onClose,
    open,
  } = props;

  const { remote } = window.require('electron');

  return (
    <Dialog
      className={classes.root}
      onClose={onClose}
      open={open}
      transition={Transition}
    >
      <EnhancedDialogTitle onClose={onClose}>
        {getLocale('about')}
      </EnhancedDialogTitle>
      <DialogContent className={classes.dialogContent}>
        <img src={iconPng} alt="Translatium" className={classes.icon} />
        <Typography variant="title" className={classes.title}>Translatium</Typography>
        <Typography
          variant="body2"
          className={classes.version}
        >
          {`Version v${remote.app.getVersion()}`}
        </Typography>

        <Button
          onClick={() => requestOpenInBrowser('https://translatiumapp.com')}
        >
          {getLocale('website')}
        </Button>

        <Button
          onClick={() => requestOpenInBrowser('https://translatiumapp.com/support')}
        >
          {getLocale('support')}
        </Button>

        <Typography variant="body2" className={classes.madeBy}>
          <span>Made with </span>
          <span role="img" aria-label="love">❤</span>
          <span> by </span>
          <span
            onClick={() => requestOpenInBrowser('https://atomery.com/')}
            onKeyDown={() => requestOpenInBrowser('https://atomery.com/')}
            role="link"
            tabIndex="0"
            className={classes.link}
          >
            Atomery
          </span>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

About.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  open: state.dialogAbout.open,
});

const actionCreators = {
  close,
};

export default connectComponent(
  About,
  mapStateToProps,
  actionCreators,
  styles,
);
