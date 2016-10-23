/* global strings */
import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { red500, fullWhite, fullBlack } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import ActionHome from 'material-ui/svg-icons/action/home';
import ToggleStar from 'material-ui/svg-icons/toggle/star';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ActionHelp from 'material-ui/svg-icons/action/help';

import { screenResize } from '../actions/screen';
import { updateImeMode } from '../actions/home';
import colorPairs from '../constants/colorPairs';

/* global window */

class App extends React.Component {
  getChildContext() {
    const { theme, primaryColorId } = this.props;

    const pTheme = (theme === 'dark') ? darkBaseTheme : lightBaseTheme;

    const { primary1Color, primary2Color } = colorPairs[primaryColorId];

    pTheme.palette.primary1Color = primary1Color;
    pTheme.palette.primary2Color = primary2Color;
    pTheme.palette.accent1Color = red500;
    pTheme.palette.alternateTextColor = fullWhite;
    pTheme.appBar = {};
    pTheme.appBar.height = 56;

    return {
      muiTheme: getMuiTheme(pTheme),
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
  }

  getStyles() {
    const { theme, primaryColorId } = this.props;
    const { primary2Color } = colorPairs[primaryColorId];

    return {
      container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'hidden',
        backgroundColor: (theme === 'dark') ? fullBlack : fullWhite,
      },
      fakeTitleBar: {
        height: 22,
        backgroundColor: primary2Color,
        color: fullWhite,
        textAlign: 'center',
        fontSize: 13,
        WebkitUserSelect: 'none',
        WebkitAppRegion: 'drag',
      },
    };
  }

  render() {
    const { children, bottomNavigationSelectedIndex, onBottomNavigationItemClick } = this.props;
    const styles = this.getStyles();

    return (
      <div className="fs" style={styles.container}>
        {process.env.PLATFORM === 'mac' ? (
          <div style={styles.fakeTitleBar}>
            Modern Translator
          </div>
        ) : null}
        {children}
        {bottomNavigationSelectedIndex > -1 ? (
          <Paper zDepth={2} style={{ zIndex: 1000 }}>
            <BottomNavigation selectedIndex={bottomNavigationSelectedIndex}>
              <BottomNavigationItem
                label={strings.home}
                icon={<ActionHome />}
                onTouchTap={() => onBottomNavigationItemClick('/')}
              />
              <BottomNavigationItem
                label={strings.phrasebook}
                icon={<ToggleStar />}
                onTouchTap={() => onBottomNavigationItemClick('/phrasebook')}
              />
              <BottomNavigationItem
                label={strings.settings}
                icon={<ActionSettings />}
                onTouchTap={() => onBottomNavigationItemClick('/settings')}
              />
              <BottomNavigationItem
                label={strings.help}
                icon={<ActionHelp />}
                onTouchTap={() => onBottomNavigationItemClick('/help')}
              />
            </BottomNavigation>
          </Paper>
        ) : null}
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element, // matched child route component
  theme: React.PropTypes.string,
  primaryColorId: React.PropTypes.string,
  bottomNavigationSelectedIndex: React.PropTypes.number,
  onResize: React.PropTypes.func,
  onBottomNavigationItemClick: React.PropTypes.func,
};

App.childContextTypes = {
  muiTheme: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  let bottomNavigationSelectedIndex = -1;
  switch (ownProps.location.pathname) {
    case '/help':
      bottomNavigationSelectedIndex = 3;
      break;
    case '/settings':
      bottomNavigationSelectedIndex = 2;
      break;
    case '/phrasebook':
      bottomNavigationSelectedIndex = 1;
      break;
    case '/':
      bottomNavigationSelectedIndex = 0;
      break;
    default:
      bottomNavigationSelectedIndex = -1;
  }


  return {
    theme: state.settings.theme,
    primaryColorId: state.settings.primaryColorId,
    bottomNavigationSelectedIndex,
  };
};

const mapDispatchToProps = dispatch => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
    dispatch(updateImeMode(null));
  },
  onBottomNavigationItemClick: (pathname) => {
    dispatch(replace(pathname));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(App);
