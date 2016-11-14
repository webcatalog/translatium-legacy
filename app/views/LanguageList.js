/* global strings */
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import { transparent } from 'material-ui/styles/colors';


import {
  getInputLanguages,
  getOutputLanguages,
  getOcrSupportedLanguages,
} from '../libs/languageUtils';

import { updateInputLang, updateOutputLang } from '../actions/settings';

class LanguageList extends React.Component {
  getStyles() {
    return {
      container: {
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      listContainer: {
        flex: 1,
        height: '100%',
        overflowY: 'auto',
      },
    };
  }

  render() {
    const { type, onCloseTouchTap, onLanguageTouchTap } = this.props;
    const styles = this.getStyles();

    let languages;
    if (type === 'inputLang') languages = getInputLanguages();
    else if (type === 'ocrInputLang') languages = getOcrSupportedLanguages();
    else languages = getOutputLanguages();

    languages.sort((x, y) => {
      if (x === 'auto') return -1;
      if (y === 'auto') return 1;
      return strings[x].localeCompare(strings[y]);
    });

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
      <div style={styles.container}>
        <AppBar
          title={type === 'inputLang' ? strings.chooseAnInputLanguage : strings.chooseAnOutputLanguage}
          iconElementLeft={<IconButton><NavigationClose /></IconButton>}
          onLeftIconButtonTouchTap={onCloseTouchTap}
        />
        <div style={styles.listContainer}>
          {Object.keys(groups).map(groupId => [(
            <List key={groupId}>
              {groups[groupId].map((langId, i) => (
                <ListItem
                  key={`lang_${langId}`}
                  primaryText={strings[langId]}
                  leftIcon={i === 0 ? (
                    <Avatar backgroundColor={transparent} style={{ left: 8, top: 4 }}>
                      {groupId}
                    </Avatar>
                  ) : null}
                  insetChildren={i > 0}
                  onTouchTap={() => onLanguageTouchTap(type, langId)}
                />
              ))}
            </List>
          ), <Divider inset />])}
        </div>
      </div>
    );
  }
}

LanguageList.propTypes = {
  type: React.PropTypes.string,
  onCloseTouchTap: React.PropTypes.func,
  onLanguageTouchTap: React.PropTypes.func,
};

const mapDispatchToProps = dispatch => ({
  onCloseTouchTap: () => {
    dispatch(push('/'));
  },
  onLanguageTouchTap: (type, value) => {
    dispatch(push('/'));

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
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(LanguageList);
