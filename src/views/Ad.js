/* global MicrosoftNSJS Windows */
import React from 'react';

import openUri from '../libs/openUri';

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
    const isMobile = Windows.System.Profile.AnalyticsInfo.deviceFamily === 'Windows.Mobile';
    const adHeight = isMobile ? 50 : 90;
    const adWidth = isMobile ? 320 : 728;

    return (
      <div style={{ width: '100vw', height: adHeight, backgroundColor: '#000', zIndex: 10000, position: 'relative' }}>
        <div
          ref={(el) => { this.adEl = el; }}
          style={{
            width: adWidth,
            height: adHeight,
            margin: '0 auto',
            zIndex: 2,
            position: 'absolute',
            left: 0,
            right: 0,
          }}
        />
        <div
          style={{
            width: adWidth,
            height: adHeight,
            margin: '0 auto',
            zIndex: 1,
            backgroundImage: `url("images/ad${adWidth}x${adHeight}.png")`,
            backgroundSize: `${adWidth}px ${adHeight}px`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            position: 'absolute',
            left: 0,
            right: 0,
          }}
          onTouchTap={() => openUri('https://getwebcatalog.com/?ref=producthunt')}
        />
      </div>
    );
  }
}

export default Ad;
