/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../../helpers/connect-component';

import {
  requestOpenInBrowser,
} from '../../../senders';

const styles = (theme) => ({
  card: {
    borderTop: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
  },
  migrationCard: {
    marginTop: theme.spacing(2),
  },
  migrationCardActions: {
    justifyContent: 'center',
  },
});

const MigrationCard = ({
  classes,
}) => {
  if (!window.process.mas) return null;
  return (
    <Card elevation={0} square className={classNames(classes.card, classes.migrationCard)}>
      <CardContent>
        <Typography variant="body2" component="p">
          Because of a few reasons, we have to republish Translatium under a new app listing.
          To continue receiving updates, please reinstall the app from our new listing.
        </Typography>
      </CardContent>
      <CardActions className={classes.migrationCardActions}>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          disableElevation
          classes={{ label: classes.translateButtonLabel }}
          onClick={() => {
            requestOpenInBrowser('macappstore://apps.apple.com/app/id1547052291');
          }}
        >
          Mac App Store
        </Button>
      </CardActions>
    </Card>
  );
};

MigrationCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default connectComponent(
  MigrationCard,
  null,
  null,
  styles,
);
