/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';

import List, { ListItem, ListItemText, ListItemIcon } from 'material-ui/List';
import ActionHistory from 'material-ui-icons/History';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui-icons/Close';

import {
  getInputLanguages,
  getOutputLanguages,
  getOcrSupportedLanguages,
} from '../libs/languageUtils';

import { updateInputLang, updateOutputLang } from '../actions/settings';

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
      type,
      recentLanguages,
      strings,
      onCloseClick,
      onLanguageClick,
    } = this.props;

    let languages;
    if (type === 'inputLang') languages = getInputLanguages();
    else if (type === 'ocrInputLang') languages = getOcrSupportedLanguages();
    else languages = getOutputLanguages();

    /* Need to add back for localizing in the future
    languages.sort((x, y) => {
      if (x === 'auto') return -1;
      if (y === 'auto') return 1;
      return strings[x].localeCompare(strings[y]);
    });
    */

    const groups = {};
    languages.forEach((x) => {
      const y = strings[x][0];
      if (groups[y]) {
        groups[y].push(x);
      } else {
        groups[y] = [x];
      }
    });


    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography type="title" color="inherit">
              {type === 'inputLang' ? strings.chooseAnInputLanguage : strings.chooseAnOutputLanguage}
              <IconButton color="contrast" onClick={onCloseClick}>
                <NavigationClose />
              </IconButton>
            </Typography>
          </Toolbar>
        </AppBar>
        <div>
          <List>
            {recentLanguages.map((langId, i) => (
              <ListItem
                key={`lang_recent_${langId}`}
                onClick={() => onLanguageClick(type, langId)}
              >
                {i === 0 && (
                  <ListItemIcon>
                    <Avatar><ActionHistory /></Avatar>
                  </ListItemIcon>
                )}
                <ListItemText primary={strings[langId]} />
              </ListItem>
            ))}
            <Divider />
          </List>
          {Object.keys(groups).map(groupId => [(
            <List key={groupId}>
              {groups[groupId].map((langId, i) => (
                <ListItem
                  key={`lang_${langId}`}
                  onClick={() => onLanguageClick(type, langId)}
                >
                  {i === 0 && (
                    <ListItemIcon>
                      <Avatar>
                        {groupId}
                      </Avatar>
                    </ListItemIcon>
                  )}
                  <ListItemText primary={strings[langId]} />
                </ListItem>
              ))}
            </List>
          ), <Divider inset />])}
        </div>
      </div>
    );
  }
}

LanguageList.propTypes = {
  recentLanguages: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.string,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onLanguageClick: PropTypes.func.isRequired,
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
)(LanguageList);
