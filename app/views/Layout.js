import React from 'react';
import { connect } from 'react-redux';

import { green500, green700, red500, fullWhite } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import ActionHome from 'material-ui/svg-icons/action/home';
import ToggleStar from 'material-ui/svg-icons/toggle/star';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ActionHelp from 'material-ui/svg-icons/action/help';

import { screenResize } from '../actions/screen';

const rawTheme = {
  palette: {
    primary1Color: green500,
    primary2Color: green700,
    accent1Color: red500,
  },
  appBar: {
    height: 56,
  },
};

/* global window */

class App extends React.Component {
  getChildContext() {
    return {
      muiTheme: getMuiTheme(rawTheme),
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
  }

  getStyles() {
    return {
      container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'hidden',
      },
      fakeTitleBar: {
        height: 22,
        backgroundColor: rawTheme.palette.primary2Color,
        color: fullWhite,
        textAlign: 'center',
        fontSize: 13,
        WebkitUserSelect: 'none',
        WebkitAppRegion: 'drag',
      },
    };
  }

  render() {
    const { children } = this.props;
    const styles = this.getStyles();

    return (
      <div className="fs" style={styles.container}>
        <div style={styles.fakeTitleBar}>
          Modern Translator
        </div>
        {children}
        <Paper zDepth={1}>
          <BottomNavigation selectedIndex={0}>
            <BottomNavigationItem
              label="Home"
              icon={<ActionHome />}
            />
            <BottomNavigationItem
              label="Favorites"
              icon={<ToggleStar />}
            />
            <BottomNavigationItem
              label="Settings"
              icon={<ActionSettings />}
            />
            <BottomNavigationItem
              label="Help"
              icon={<ActionHelp />}
            />
          </BottomNavigation>
        </Paper>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element, // matched child route component
  onResize: React.PropTypes.func,
};

App.childContextTypes = {
  muiTheme: React.PropTypes.object,
};

const mapDispatchToProps = dispatch => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
  },
});

export default connect(
  null, mapDispatchToProps
)(App);
