/* global strings */
import React from 'react';

import AppBar from 'material-ui/AppBar';

class Help extends React.Component {
  getStyles() {
    return {
      container: {
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      contentContainer: {
        flex: 1,
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      innerContentContainer: {
        textAlign: 'center',
      },
      icon: {
        height: 128,
        width: 128,
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
          <div style={styles.innerContentContainer}>
            <img src="../images/icon.png" role="presentation" style={styles.icon} />
            <h3>Modern Translator</h3>
            <h4>Version {process.env.VERSION}</h4>
          </div>
        </div>
      </div>
    );
  }
}

export default Help;
