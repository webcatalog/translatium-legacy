/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';

import { withStyles, createStyleSheet } from 'material-ui/styles';
import List, { ListItem, ListItemText } from 'material-ui/List';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';

import {
  getInputLanguages,
  getOutputLanguages,
  getOcrSupportedLanguages,
} from '../libs/languageUtils';

import { updateInputLang, updateOutputLang } from '../actions/settings';

const styleSheet = createStyleSheet('LanguageList', {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
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
      recentLanguages,
      strings,
      type,
    } = this.props;

    let languages;
    if (type === 'inputLang') languages = getInputLanguages();
    else if (type === 'ocrInputLang') languages = getOcrSupportedLanguages();
    else languages = getOutputLanguages();

    languages.sort((x, y) => {
      if (x === 'auto') return -1;
      if (y === 'auto') return 1;
      return strings[x].localeCompare(strings[y]);
    });

    return (
      <div className={classes.container}>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="contrast" onClick={onCloseClick}>
              <CloseIcon />
            </IconButton>
            <Typography type="title" color="inherit">
              {type === 'inputLang' ? strings.chooseAnInputLanguage : strings.chooseAnOutputLanguage}
            </Typography>
          </Toolbar>
        </AppBar>
        <List className={classes.listContainer}>
          {recentLanguages.map(langId => (
            <ListItem
              key={`lang_recent_${langId}`}
              onClick={() => onLanguageClick(type, langId)}
            >
              <ListItemText primary={strings[langId]} />
            </ListItem>
          ))}
          <Divider />
          {languages.map(langId => (
            <ListItem
              key={`lang_${langId}`}
              onClick={() => onLanguageClick(type, langId)}
            >
              <ListItemText primary={strings[langId]} />
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

LanguageList.propTypes = {
  classes: PropTypes.object.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onLanguageClick: PropTypes.func.isRequired,
  recentLanguages: PropTypes.arrayOf(PropTypes.string),
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  type: PropTypes.string,
};

const mapDispatchToProps = dispatch => ({
  onCloseClick: () => dispatch(goBack()),
  onLanguageClick: (type, value) => {
    dispatch(goBack());

    if (type === 'inputLang') {
      dispatch(updateInputLang(value));
    } else if (type === 'outputLang') {
      dispatch(updateOutputLang(value));
    }
  },
});

const mapStateToProps = (state, ownProps) => ({
  recentLanguages: state.settings.recentLanguages,
  type: ownProps.location.query.type,
  strings: state.strings,
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(withStyles(styleSheet)(LanguageList));
