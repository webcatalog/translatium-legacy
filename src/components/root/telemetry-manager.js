/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useEffect } from 'react';
import PropTypes from 'prop-types';

import connectComponent from '../../helpers/connect-component';

import amplitude from '../../amplitude';

const TelemetryManager = ({ displayLanguage, telemetry }) => {
  useEffect(() => {
    amplitude.getInstance().setOptOut(!telemetry);
  }, [telemetry]);

  useEffect(() => {
    amplitude.getInstance().setUserProperties({
      displayLanguage,
    });
  }, [displayLanguage]);

  // run after setUserProperties
  // https://blog.logrocket.com/post-hooks-guide-react-call-order
  useEffect(() => {
    amplitude.getInstance().logEvent('start app');
  }, []);

  return null;
};

TelemetryManager.defaultProps = {
  telemetry: false,
};

TelemetryManager.propTypes = {
  displayLanguage: PropTypes.string.isRequired,
  telemetry: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  displayLanguage: state.preferences.displayLanguage,
  telemetry: state.preferences.telemetry,
});

export default connectComponent(
  TelemetryManager,
  mapStateToProps,
  null,
);
