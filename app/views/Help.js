/* global strings */
import React from 'react';

import AppBar from 'material-ui/AppBar';

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
          <div style={styles.innerContentContainer}>
            <img src="../images/icon.png" role="presentation" style={styles.icon} />
            <h3 style={styles.text}>Modern Translator</h3>
            <h4 style={styles.text}>Version {process.env.VERSION}</h4>
          </div>
        </div>
      </div>
    );
  }
}

Help.contextTypes = {
  muiTheme: React.PropTypes.object,
};

export default Help;
