/* global document */
import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { changeRoute } from '../../../state/root/router/actions';
import { ROUTE_HOME, ROUTE_LANGUAGE_LIST } from '../../../constants/routes';

import LanguageListList from './list';
import SearchBox from './search-box';

const styles = (theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  title: {
    flexGrow: 1,
  },
  appBarColorDefault: {
    // eslint-disable-next-line no-nested-ternary
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : (window.process.platform === 'darwin' ? theme.palette.primary.main : null),
    // eslint-disable-next-line no-nested-ternary
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : (window.process.platform === 'darwin' ? theme.palette.primary.contrastText : null),
  },
  toolbar: {
    minHeight: 40,
    paddingRight: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
  },
  toolbarIconButton: {
    padding: theme.spacing(1),
  },
});

class LanguageList extends React.Component {
  constructor(props) {
    super(props);

    this.handleEscKey = this.handleEscKey.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleEscKey);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
  }

  handleEscKey(evt) {
    const { route, onChangeRoute } = this.props;
    if (route !== ROUTE_LANGUAGE_LIST || window.preventEsc) {
      return;
    }
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      onChangeRoute(ROUTE_HOME);
    }
  }

  render() {
    const {
      classes,
      mode,
      onChangeRoute,
    } = this.props;

    return (
      <div className={classes.container}>
        <AppBar position="static" color="default" elevation={0} classes={{ colorDefault: classes.appBarColorDefault }}>
          <Toolbar variant="dense" className={classes.toolbar}>
            <Typography variant="subtitle1" color="inherit" className={classes.title}>
              {mode === 'inputLang' ? getLocale('selectInputLang') : getLocale('selectOutputLang')}
            </Typography>
            <Tooltip title={getLocale('close')} placement="left">
              <IconButton
                color="inherit"
                className={classes.toolbarIconButton}
                aria-label={getLocale('close')}
                onClick={() => onChangeRoute(ROUTE_HOME)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <SearchBox />
        <LanguageListList />
      </div>
    );
  }
}

LanguageList.propTypes = {
  classes: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
};

const actionCreators = {
  changeRoute,
};

const mapStateToProps = (state) => ({
  mode: state.pages.languageList.mode,
  recentLanguages: state.preferences.recentLanguages,
  route: state.router.route,
  search: state.pages.languageList.search,
});

export default connectComponent(
  LanguageList,
  mapStateToProps,
  actionCreators,
  styles,
);
