/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import MLink from '@material-ui/core/Link';

import connectComponent from '../../helpers/connect-component';
import getLocale from '../../helpers/get-locale';

import { close } from '../../state/root/dialog-about/actions';
import { open as openDialogOpenSourceNotices } from '../../state/root/dialog-open-source-notices/actions';
import translatiumIconPng from '../../images/products/translatium-mac-icon-128@2x.png';

import { requestOpenInBrowser } from '../../senders';

import EnhancedDialogTitle from '../shared/enhanced-dialog-title';

const styles = (theme) => ({
  icon: {
    height: 96,
    width: 96,
  },
  dialogContent: {
    minWidth: 280,
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
    lineHeight: 1,
  },
});

const About = (props) => {
  const {
    classes,
    onClose,
    onOpenDialogOpenSourceNotices,
    open,
  } = props;

  return (
    <Dialog
      className={classes.root}
      onClose={onClose}
      open={open}
    >
      <EnhancedDialogTitle onClose={onClose}>
        {getLocale('about')}
      </EnhancedDialogTitle>
      <DialogContent className={classes.dialogContent}>
        <img src={translatiumIconPng} alt="Translatium" className={classes.icon} />
        <Typography variant="h6" className={classes.title}>Translatium</Typography>
        <Typography
          variant="body2"
          className={classes.version}
        >
          {`Version v${window.remote.app.getVersion()}`}
        </Typography>

        <Button
          onClick={() => requestOpenInBrowser('https://webcatalog.io/translatium/?utm_source=translatium_app')}
        >
          {getLocale('website')}
        </Button>

        <Button
          onClick={() => requestOpenInBrowser('https://webcatalog.io/translatium/help/?utm_source=translatium_app')}
        >
          {getLocale('support')}
        </Button>

        <br />

        <Button
          onClick={onOpenDialogOpenSourceNotices}
        >
          Open Source Notices
        </Button>

        <Typography variant="body2" className={classes.madeBy}>
          <span>Made with </span>
          <span role="img" aria-label="love">❤</span>
          <span> by </span>
          <MLink
            component="button"
            variant="body2"
            onClick={() => requestOpenInBrowser('https://webcatalog.app/about?utm_source=translatium_app')}
            className={classes.link}
          >
            WebCatalog Ltd
          </MLink>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

About.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenDialogOpenSourceNotices: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  open: state.dialogAbout.open,
});

const actionCreators = {
  close,
  openDialogOpenSourceNotices,
};

export default connectComponent(
  About,
  mapStateToProps,
  actionCreators,
  styles,
);
