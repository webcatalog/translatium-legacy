/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import { goBack } from 'react-router-redux';

import AppBar from '@material-ui/core/AppBar';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Input from '@material-ui/core/Input/Input';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import grey from '@material-ui/core/colors/grey';

import connectComponent from '../../helpers/connect-component';

import {
  getInputLanguages,
  getOutputLanguages,
  getOcrSupportedLanguages,
} from '../../helpers/language-utils';

import { updateInputLang, updateOutputLang } from '../../state/root/preferences/actions';
import { updateLanguageListSearch } from '../../state/pages/language-list/actions';

const styles = (theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  inputContainer: {
    background: theme.palette.background.paper,
    display: 'flex',
    paddingTop: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit,
    borderBottom: `solid 1px ${grey[300]}`,
  },
  input: {
    width: '100%',
    fontSize: 16,
    '&::before': {
      background: 'none',
    },
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  clearButton: {
    color: grey[500],
  },
  title: {
    flexGrow: 1,
  },
  appBarColorDefault: {
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
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
    const { onCloseClick } = this.props;
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      onCloseClick();
    }
  }

  render() {
    const {
      classes,
      onCloseClick,
      onLanguageClick,
      onUpdateLanguageListSearch,
      recentLanguages,
      search,
      type,
      locale,
    } = this.props;

    let languages;
    if (type === 'inputLang') languages = getInputLanguages();
    else if (type === 'ocrInputLang') languages = getOcrSupportedLanguages();
    else languages = getOutputLanguages();

    languages.sort((x, y) => {
      if (x === 'auto') return -1;
      if (y === 'auto') return 1;
      return locale[x].localeCompare(locale[y]);
    });

    let searchResults = [];
    if (search) {
      searchResults = languages.filter((langId) => {
        if (locale[langId].toLowerCase().indexOf(search.toLowerCase()) < 0) {
          return false;
        }

        return true;
      });
    }

    return (
      <div className={classes.container}>
        <AppBar position="static" color="default" classes={{ colorDefault: classes.appBarColorDefault }}>
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" className={classes.title}>
              {type === 'inputLang' ? locale.chooseAnInputLanguage : locale.chooseAnOutputLanguage}
            </Typography>
            <IconButton color="inherit" onClick={onCloseClick}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className={classes.inputContainer}>
          <Input
            value={search}
            placeholder={locale.searchLanguages}
            className={classes.input}
            inputProps={{
              'aria-label': locale.searchLanguages,
            }}
            onChange={(event) => onUpdateLanguageListSearch(event.target.value)}
          />
          {search && search.length > 0 && (
            <CloseIcon className={classes.clearButton} onClick={() => onUpdateLanguageListSearch('')} />
          )}
        </div>
        {(search && search.length > 0) ? (
          <div className={classes.listContainer}>
            <List
              subheader={<ListSubheader disableSticky>{locale.searchResults}</ListSubheader>}
            >
              {searchResults.length < 1 ? (
                <ListItem
                  button
                  disabled
                >
                  <ListItemText primary={locale.noLanguageFound} />
                </ListItem>
              )
                : searchResults.map((langId) => (
                  <ListItem
                    button
                    key={`lang_${langId}`}
                    onClick={() => onLanguageClick(type, langId)}
                  >
                    <ListItemText primary={locale[langId]} />
                  </ListItem>
                ))}
            </List>
          </div>
        ) : (
          <div className={classes.listContainer}>
            <List
              subheader={<ListSubheader disableSticky>{locale.recentlyUsed}</ListSubheader>}
            >
              {recentLanguages.map((langId) => (
                <ListItem
                  button
                  key={`lang_recent_${langId}`}
                  onClick={() => onLanguageClick(type, langId)}
                >
                  <ListItemText primary={locale[langId]} />
                </ListItem>
              ))}
            </List>
            <Divider />
            <List
              subheader={<ListSubheader disableSticky>{locale.allLanguages}</ListSubheader>}
            >
              {languages.map((langId) => (
                <ListItem
                  button
                  key={`lang_${langId}`}
                  onClick={() => onLanguageClick(type, langId)}
                >
                  <ListItemText primary={locale[langId]} />
                </ListItem>
              ))}
            </List>
          </div>
        )}
      </div>
    );
  }
}

LanguageList.propTypes = {
  classes: PropTypes.object.isRequired,
  locale: PropTypes.object.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onLanguageClick: PropTypes.func.isRequired,
  onUpdateLanguageListSearch: PropTypes.func.isRequired,
  recentLanguages: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
  type: PropTypes.string,
};

const mapDispatchToProps = (dispatch) => ({
  onCloseClick: () => dispatch(goBack()),
  onLanguageClick: (type, value) => {
    dispatch(goBack());

    if (type === 'inputLang') {
      dispatch(updateInputLang(value));
    } else if (type === 'outputLang') {
      dispatch(updateOutputLang(value));
    }
  },
  onUpdateLanguageListSearch: (search) => dispatch(updateLanguageListSearch(search)),
});

const mapStateToProps = (state, ownProps) => ({
  recentLanguages: state.preferences.recentLanguages,
  search: state.pages.languageList.search,
  type: ownProps.location.query.type,
  locale: state.locale,
});

export default connectComponent(
  LanguageList,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
