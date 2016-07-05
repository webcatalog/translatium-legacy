/* global Windows WinJS */

import React from 'react';
import { connect } from 'react-redux';
import { replace, goBack } from 'react-router-redux';

import { screenResize } from '../../actions/screen';
import { updateSetting } from '../../actions/settings';

import { materialDesignColors } from '../../constants/colors';

import Title from './Title';

import i18n from '../../i18n';
import openUri from '../../openUri';


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
    statusBar.showAsync();
  }
};

const canGoBack = (location) =>
  (['/', '/phrasebook', '/settings', '/about']
    .indexOf(location.pathname) < 0);

class Layout extends React.Component {
  componentWillMount() {
    const { theme, primaryColorId, onBackClick } = this.props;
    setAppTheme(theme);
    setAppColor(primaryColorId);

    const systemNavigationManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
    systemNavigationManager.onbackrequested = (e) => {
      const { location } = this.props;
      if (canGoBack(location) === true) {
        onBackClick();
      } else {
        /* eslint-disable */
        e.handled = true;
        /* eslint-enable */
      }
    };
  }

  componentDidMount() {
    const { launchTime, onResize, onUpdateLaunchTime } = this.props;

    window.addEventListener('resize', onResize);

    onUpdateLaunchTime(launchTime + 1);

    if (launchTime === 10) {
      const askForFeedback = () => {
        const content = i18n('would-you-mind-giving-us-some-feedback');
        const msg = new Windows.UI.Popups.MessageDialog(content);
        msg.commands.append(
          new Windows.UI.Popups.UICommand(
            i18n('ok-sure'),
            () => {
              openUri('mailto:support@moderntranslator.com');
            }
          )
        );
        msg.commands.append(
          new Windows.UI.Popups.UICommand(
            i18n('no-thanks'),
            () => {}
          )
        );
        msg.showAsync().done();

        onUpdateLaunchTime(-100);
      };

      const askForRating = () => {
        const content = i18n('how-are-about-a-rating');
        const msg = new Windows.UI.Popups.MessageDialog(content);
        msg.commands.append(
          new Windows.UI.Popups.UICommand(
            i18n('ok-sure'),
            () => {
              openUri('ms-windows-store://review/?ProductId=9wzdncrcsg9k');
            }
          )
        );
        msg.commands.append(
          new Windows.UI.Popups.UICommand(
            i18n('no-thanks'),
            () => {}
          )
        );
        msg.showAsync().done();
      };

      const askForFeeling = () => {
        const content = i18n('enjoying-the-app');
        const msg = new Windows.UI.Popups.MessageDialog(content);
        msg.commands.append(
          new Windows.UI.Popups.UICommand(
            i18n('yes'),
            askForRating
          )
        );
        msg.commands.append(
          new Windows.UI.Popups.UICommand(
            i18n('not-really'),
            askForFeedback
          )
        );
        msg.showAsync().done();
      };

      askForFeeling();
    }
  }

  componentWillUpdate(nextProps) {
    const { theme, primaryColorId, location } = this.props;
    if (theme !== nextProps.theme) {
      setAppTheme(nextProps.theme);
    }

    if (primaryColorId !== nextProps.primaryColorId) {
      setAppColor(nextProps.primaryColorId);
    }

    if (location.pathname !== nextProps.location.pathname) {
      const systemNavigationManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
      systemNavigationManager.appViewBackButtonVisibility
        = canGoBack(nextProps.location) ? Windows.UI.Core.AppViewBackButtonVisibility.visible
                               : Windows.UI.Core.AppViewBackButtonVisibility.collapsed;
    }
  }


  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
    WinJS.Application.onbackclick = null;
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
        {canGoBack(location) === false ? (
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
        ) : null}
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
  launchTime: React.PropTypes.number.isRequired,
  onResize: React.PropTypes.func.isRequired,
  onTabbarItemClick: React.PropTypes.func.isRequired,
  onBackClick: React.PropTypes.func.isRequired,
  onUpdateLaunchTime: React.PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
  },
  onTabbarItemClick: (pathname) => {
    dispatch(replace(pathname));
  },
  onBackClick: () => {
    dispatch(goBack());
  },
  onUpdateLaunchTime: (launchTime) => {
    dispatch(updateSetting('launchTime', launchTime));
  },
});

const mapStateToProps = (state) => ({
  screenWidth: state.screen.screenWidth,
  theme: state.settings.theme,
  primaryColorId: state.settings.primaryColorId,
  launchTime: state.settings.launchTime,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Layout);
