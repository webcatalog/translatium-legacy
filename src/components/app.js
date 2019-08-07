import React from 'react';
import PropTypes from 'prop-types';
import { replace } from 'react-router-redux';

import CircularProgress from '@material-ui/core/CircularProgress';
import ActionHome from '@material-ui/icons/Home';
import ActionSettings from '@material-ui/icons/Settings';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import ToggleStar from '@material-ui/icons/Star';

import connectComponent from '../helpers/connect-component';

import { screenResize } from '../state/root/screen/actions';
import { closeSnackbar } from '../state/root/snackbar/actions';

import Alert from './root/alert';

import strings from '../strings/en.json';

const styles = theme => ({
  container: {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  fullPageProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100vh',
    width: '100vw',
    zIndex: 10000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeTitleBar: {
    flexBasis: 22,
    height: 22,
    backgroundColor: theme.palette.primary.dark,
    color: '#fff',
    textAlign: 'center',
    fontSize: 13,
    WebkitUserSelect: 'none',
    WebkitAppRegion: 'drag',
    lineHeight: '22px',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  icon: {
    display: 'block',
    margin: 'auto',
  },
});

class App extends React.Component {
  componentWillUnmount() {
    const { onResize } = this.props;
    window.removeEventListener('resize', onResize);
  }

  render() {
    const {
      attachToMenubar,
      bottomNavigationSelectedIndex,
      children,
      classes,
      fullPageLoading,
      onBottomNavigationActionClick,
      onRequestCloseSnackbar,
      shouldShowBottomNav,
      snackbarMessage,
      snackbarOpen,
    } = this.props;

    return (
      <div className={classes.container}>
        {!attachToMenubar && (
          <div className={classes.fakeTitleBar}>
            Translatium
          </div>
        )}
        <div className={classes.contentContainer}>
          {fullPageLoading && (
            <div className={classes.fullPageProgress}>
              <CircularProgress size={80} />
            </div>
          )}
          <Alert />
          <Snackbar
            open={snackbarOpen}
            message={snackbarMessage || ''}
            autoHideDuration={4000}
            onClose={onRequestCloseSnackbar}
            action={(
              <Button color="secondary" size="small" onClick={onRequestCloseSnackbar}>
                {strings.close}
              </Button>
            )}
          />
          {children}
          {bottomNavigationSelectedIndex > -1 && shouldShowBottomNav && (
            <Paper elevation={2} style={{ zIndex: 1000 }}>
              <BottomNavigation value={bottomNavigationSelectedIndex} showLabels>
                <BottomNavigationAction
                  label={strings.home}
                  icon={<ActionHome className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick('/')}
                />
                <BottomNavigationAction
                  label={strings.phrasebook}
                  icon={<ToggleStar className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick('/phrasebook')}
                />
                <BottomNavigationAction
                  label={strings.preferences}
                  icon={<ActionSettings className={classes.icon} />}
                  onClick={() => onBottomNavigationActionClick('/preferences')}
                />
              </BottomNavigation>
            </Paper>
          )}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  attachToMenubar: PropTypes.bool.isRequired,
  bottomNavigationSelectedIndex: PropTypes.number.isRequired,
  children: PropTypes.element.isRequired, // matched child route component
  classes: PropTypes.object.isRequired.isRequired,
  fullPageLoading: PropTypes.bool.isRequired,
  onBottomNavigationActionClick: PropTypes.func.isRequired,
  onRequestCloseSnackbar: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  shouldShowBottomNav: PropTypes.bool.isRequired,
  snackbarMessage: PropTypes.string,
  snackbarOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  let bottomNavigationSelectedIndex = -1;
  switch (ownProps.location.pathname) {
    case '/help':
      bottomNavigationSelectedIndex = 3;
      break;
    case '/preferences':
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
    attachToMenubar: state.preferences.attachToMenubar,
    bottomNavigationSelectedIndex,
    fullPageLoading: Boolean(state.pages.ocr && state.pages.ocr.status === 'loading'),
    pathname: ownProps.location.pathname,
    shouldShowBottomNav: true,
    snackbarMessage: state.snackbar.message,
    snackbarOpen: state.snackbar.open,
  };
};

const mapDispatchToProps = dispatch => ({
  onResize: () => {
    dispatch(screenResize(window.innerWidth));
  },
  onBottomNavigationActionClick: pathname => dispatch(replace(pathname)),
  onRequestCloseSnackbar: () => dispatch(closeSnackbar()),
});

export default connectComponent(
  App,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
