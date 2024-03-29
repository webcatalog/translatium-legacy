/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';

import getLocale from '../../../helpers/get-locale';

import {
  requestOpenInBrowser,
  requestSetPreference,
} from '../../../senders';

const useStyles = makeStyles((theme) => ({
  card: {
    borderTop: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
  },
  ratingCard: {
    marginTop: theme.spacing(2),
  },
  ratingCardActions: {
    justifyContent: 'center',
  },
}));

const RatingCard = () => {
  const classes = useStyles();

  // "ratingCardLastClicked2"
  // instead of "ratingCardLastClicked" because "ratingCardLastClicked" is corrupted and abandoned
  const ratingCardLastClicked = useSelector((state) => state.preferences.ratingCardLastClicked2);
  const ratingCardDidRate = useSelector((state) => state.preferences.ratingCardDidRate2);

  if (!window.process.mas && !window.process.windowsStore) return null;

  // time gap between rating card request
  // 3 months if user has rated the app, 1 week if user has not
  const gap = ratingCardDidRate ? 3 * 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const now = Date.now();

  if (now > ratingCardLastClicked + gap) {
    return (
      <Card elevation={0} square className={classNames(classes.card, classes.ratingCard)}>
        <CardActions className={classes.ratingCardActions}>
          {window.process.mas && (
            <Button
              variant="contained"
              size="small"
              color="primary"
              disableElevation
              classes={{ label: classes.translateButtonLabel }}
              onClick={() => {
                requestSetPreference('ratingCardLastClicked', Date.now());
                requestSetPreference('ratingCardDidRate', true);
                requestOpenInBrowser('macappstore://apps.apple.com/app/id1547052291?action=write-review');
              }}
            >
              {getLocale('rateMacAppStore')}
            </Button>
          )}
          {window.process.windowsStore && (
            <Button
              variant="contained"
              size="small"
              color="primary"
              disableElevation
              classes={{ label: classes.translateButtonLabel }}
              onClick={() => {
                requestSetPreference('ratingCardLastClicked', Date.now());
                requestSetPreference('ratingCardDidRate', true);
                requestOpenInBrowser('ms-windows-store://review/?ProductId=9MWPG56JKS38');
              }}
            >
              {getLocale('rateMicrosoftStore')}
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            color="default"
            disableElevation
            classes={{ label: classes.translateButtonLabel }}
            onClick={() => {
              requestSetPreference('ratingCardLastClicked', Date.now());
            }}
          >
            {getLocale('later')}
          </Button>
        </CardActions>
      </Card>
    );
  }

  return null;
};

export default RatingCard;
