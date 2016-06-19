/* global Windows */

import React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { screenResize } from '../../actions/screen';

import { materialDesignColors } from '../../constants/colors';

import Title from './Title';

const setAppTheme = (theme) => {
  // Theme
  [`winjs/css/ui-${theme}.min.css`, `app-${theme}.min.css`].forEach(url => {
    const ss = document.styleSheets;
    for (let i = 0, max = ss.length; i < max; i++) {
      if (ss[i].href === url) return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  });
};

const setAppColor = (primaryColorId) => {
  const color = materialDesignColors[primaryColorId];
  const regCode = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.dark);
  const backgroundColor = {
    r: parseInt(regCode[1], 16),
    g: parseInt(regCode[2], 16),
    b: parseInt(regCode[3], 16),
    a: 1,
  };
  const foregroundColor = { r: 255, g: 255, b: 255, a: 1 };

  // PC
  if (Windows.UI.ViewManagement.ApplicationView) {
    const v = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
    v.titleBar.backgroundColor = backgroundColor;
    v.titleBar.foregroundColor = foregroundColor;
    v.titleBar.buttonBackgroundColor = backgroundColor;
    v.titleBar.buttonForegroundColor = foregroundColor;
  }

  if (Windows.UI.ViewManagement.StatusBar) {
    const statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
    statusBar.backgroundColor = backgroundColor;
    statusBar.foregroundColor = foregroundColor;
    statusBar.backgroundOpacity = 1;
  }
};


class Layout extends React.Component {
  componentWillMount() {
    const { theme, primaryColorId } = this.props;
    setAppTheme(theme);
    setAppColor(primaryColorId);
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onResize);
  }

  componentWillUpdate(nextProps) {
    const { theme, primaryColorId } = this.props;
    if (theme !== nextProps.theme) {
      setAppTheme(nextProps.theme);
    }

    if (primaryColorId !== nextProps.primaryColorId) {
      setAppColor(nextProps.primaryColorId);
    }
  }


  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
  }

  render() {
    const {
      children,
      primaryColorId,
      onTabbarItemClick,
      location,
    } = this.props;

    return (
      <div className="win-type-body app-layout">
        <div
          style={{
            backgroundColor: materialDesignColors[primaryColorId].light,
          }}
          className="win-ui-dark app-topbar"
        >
          <Title location={location} />
        </div>
        <div className="app-content">
          {children}
        </div>
        <div className="app-tabbar">
          <div
            className="app-tabbar-item"
            onClick={() => onTabbarItemClick('/')}
          >
            
          </div>
          <div
            className="app-tabbar-item"
            onClick={() => onTabbarItemClick('/phrasebook')}
          >
            
          </div>
          <div
            className="app-tabbar-item"
            onClick={() => onTabbarItemClick('/settings')}
          >
            
          </div>
          <div
            className="app-tabbar-item"
            onClick={() => onTabbarItemClick('/about')}
          >
            
          </div>
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  location: React.PropTypes.object.isRequired,  // current router location
  children: React.PropTypes.node.isRequired, // matched child route component
  screenWidth: React.PropTypes.number.isRequired,
  theme: React.PropTypes.string.isRequired,
  primaryColorId: React.PropTypes.string.isRequired,
  onResize: React.PropTypes.func.isRequired,
  onTabbarItemClick: React.PropTypes.func.isRequired,
};


const mapDispatchToProps = (dispatch) => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
  },
  onTabbarItemClick: (pathname) => {
    dispatch(replace(pathname));
  },
});

const mapStateToProps = (state) => ({
  screenWidth: state.screen.screenWidth,
  theme: state.settings.theme,
  primaryColorId: state.settings.primaryColorId,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Layout);
