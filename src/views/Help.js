/* global strings */
import React from 'react';

import AppBar from 'material-ui/AppBar';

import openUri from '../libs/openUri';

class Help extends React.Component {
  getStyles() {
    const {
      palette: {
        textColor,
      },
    } = this.context.muiTheme;


    return {
      container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      },
      contentContainer: {
        flex: 1,
        padding: '12px 24px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        textAlign: 'center',
      },
      icon: {
        height: 100,
        width: 100,
        borderRadius: 50,
      },
      smallerIcon: {
        height: 60,
        width: 60,
        borderRadius: 30,
      },
      text: {
        color: textColor,
      },
    };
  }

  render() {
    const styles = this.getStyles();

    return (
      <div style={styles.container}>
        <AppBar
          title={strings.help}
          showMenuIconButton={false}
        />
        <div style={styles.contentContainer}>
          <img
            src="images/modern-translator@2x.png"
            role="presentation"
            style={styles.icon}
            alt="Modern Translator"
          />
          <h3 style={styles.text}>Modern Translator</h3>
          <h4 style={styles.text}>Version {process.env.VERSION}</h4>

          {process.env.PLATFORM === 'mac' ? (
            <p>
              <a onTouchTap={() => openUri('macappstore://itunes.apple.com/app/id1176624652?mt=12')} tabIndex={0}>
                {strings.rateMacAppStore}
              </a>
            </p>
          ) : null}

          {process.env.PLATFORM === 'windows' ? (
            <p>
              <a onTouchTap={() => openUri('ms-windows-store://review/?ProductId=9wzdncrcsg9k')} tabIndex={0}>
                {strings.rateWindowsStore}
              </a>
            </p>
          ) : null}

          <p><a onTouchTap={() => openUri('mailto:support@moderntranslator.com')} tabIndex={0}>Support</a></p>

          <p><a onTouchTap={() => openUri('https://moderntranslator.com')} tabIndex={0}>Website</a></p>

          <p><a onTouchTap={() => openUri('https://moderntranslator.com/release-notes')} tabIndex={0}>Release Notes</a></p>

          <h2 style={{ marginTop: 60 }}>Other Apps</h2>
          <a onTouchTap={() => openUri('https://getwebcatalog.com')}>
            <img
              src="images/webcatalog@2x.png"
              role="presentation"
              style={styles.smallerIcon}
              alt="Modern Translator"
            />
          </a>
          <h3 style={styles.text}><a onTouchTap={() => openUri('https://getwebcatalog.com')} tabIndex={0}>WebCatalog</a></h3>
          <h4 style={styles.text}>Run your favorite web apps natively</h4>

          <div style={{ height: 24 }} />
        </div>
      </div>
    );
  }
}

Help.contextTypes = {
  muiTheme: React.PropTypes.object,
};

export default Help;
