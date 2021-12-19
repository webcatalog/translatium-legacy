/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import {
  requestSetPreference,
} from '../../../senders';

const styles = (theme) => ({
  sliderContainer: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(5),
  },
  sliderTitleContainer: {
    paddingTop: `${theme.spacing(1.5)}px !important`,
    width: 160,
  },
  sliderMarkLabel: {
    fontSize: '0.75rem',
  },
});

// Well, math
// we use different scaling system for the slider to make it look nice
const convertSliderValToPreferenceVal = (val) => {
  if (val >= 0) return val + 10; // 0 -> 10, 30 -> 40
  return 10 + (val * 2) / 10; // -25 => 5
};

const convertPreferenceValToSliderVal = (val) => {
  if (val >= 10) return val - 10; // 10 -> 0, 40 -> 30
  return (val - 10) * 5; // 5 -> -25
};

const ListItemSliders = ({
  classes,
  voiceSpeed,
}) => (
  <ListItem>
    <ListItemText className={classes.sliderContainer}>
      <Grid container spacing={2}>
        <Grid classes={{ item: classes.sliderTitleContainer }} item>
          <Typography id="brightness-slider" variant="body2" gutterBottom={false}>
            {getLocale('voiceSpeed')}
          </Typography>
        </Grid>
        <Grid item xs>
          <Slider
            classes={{ markLabel: classes.sliderMarkLabel }}
            value={convertPreferenceValToSliderVal(voiceSpeed)}
            aria-labelledby="voice-speed-slider"
            valueLabelDisplay="auto"
            step={5}
            // for look, the slider uses different scale
            // from what we're actually storing in JSON
            valueLabelFormat={(val) => {
              if (val < 0) return `${1 + (val * 2) / 100}x`;
              return `${(val + 10) / 10}x`;
            }}
            marks={[
              {
                value: -25,
                label: getLocale('slowest'),
              },
              {
                value: 0,
                label: getLocale('normal'),
              },
              {
                value: 40,
                label: getLocale('fastest'),
              },
            ]}
            min={-25}
            max={40}
            onChange={(e, value) => {
              requestSetPreference('voiceSpeed', convertSliderValToPreferenceVal(value));
            }}
          />
        </Grid>
      </Grid>
    </ListItemText>
  </ListItem>
);

ListItemSliders.propTypes = {
  classes: PropTypes.object.isRequired,
  voiceSpeed: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  voiceSpeed: state.preferences.voiceSpeed,
});

export default connectComponent(
  ListItemSliders,
  mapStateToProps,
  null,
  styles,
);
