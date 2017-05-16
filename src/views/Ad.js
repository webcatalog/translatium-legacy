/* global MicrosoftNSJS Windows */
import React from 'react';

class Ad extends React.Component {
  componentDidMount() {
    this.msAd = new MicrosoftNSJS.Advertising.AdControl(this.adEl, {
      applicationId: process.env.NODE_ENV === 'production' ? '9wzdncrcsg9k' : '3f83fe91-d6be-434d-a0ae-7351c5a997f1',
      adUnitId: process.env.NODE_ENV === 'production' ? '11683627' : 'test',
    });
  }

  componentWillUnmount() {
    this.msAd.dispose();
  }

  render() {
    // https://msdn.microsoft.com/windows/hardware/commercialize/customize/desktop/unattend/microsoft-windows-deployment-deviceform
    const isMobile = Windows.System.Profile.AnalyticsInfo.deviceFamily === 'Windows.Desktop';

    return (
      <div style={{ width: '100vw', backgroundColor: '#000' }}>
        <div
          ref={(el) => { this.adEl = el; }}
          style={{ width: isMobile ? 320 : 728, height: isMobile ? 50 : 90, margin: '0 auto' }}
        />
      </div>
    );
  }
}

export default Ad;
