import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import {
  requestOpenInBrowser,
  requestSetPreference,
} from '../../../senders';

const styles = (theme) => ({
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
});

const RatingCard = ({
  classes,
  ratingCardLastClicked,
  ratingCardDidRate,
}) => {
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
                requestOpenInBrowser('macappstore://apps.apple.com/app/id1176624652?action=write-review');
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
                requestOpenInBrowser('ms-windows-store://review/?ProductId=9wzdncrcsg9k');
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

RatingCard.defaultProps = {
  ratingCardLastClicked: 0,
  ratingCardDidRate: false,
};

RatingCard.propTypes = {
  classes: PropTypes.object.isRequired,
  ratingCardLastClicked: PropTypes.number,
  ratingCardDidRate: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  ratingCardLastClicked: state.preferences.ratingCardLastClicked,
  ratingCardDidRate: state.preferences.ratingCardDidRate,
});

export default connectComponent(
  RatingCard,
  mapStateToProps,
  null,
  styles,
);
