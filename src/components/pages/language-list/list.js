/* global document */
import React from 'react';
import PropTypes from 'prop-types';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { changeRoute } from '../../../state/root/router/actions';
import { updateInputLang, updateOutputLang } from '../../../state/root/preferences/actions';
import { ROUTE_HOME, ROUTE_OCR } from '../../../constants/routes';

import {
  getLanguages,
  isOcrSupported,
} from '../../../helpers/language-utils';

const styles = {
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
};

const langList = getLanguages()
  .map((id) => ({
    id,
    locale: getLocale(id),
    ocr: isOcrSupported(id),
  }))
  .sort((x, y) => {
    if (x.id === 'auto') return -1;
    if (y.id === 'auto') return 1;
    return x.locale.localeCompare(y.locale);
  });


class LanguageListList extends React.Component {
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
    const { onChangeRoute, mode } = this.props;
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      if (mode && mode.startsWith('ocr')) {
        onChangeRoute(ROUTE_OCR);
      } else {
        onChangeRoute(ROUTE_HOME);
      }
    }
  }

  render() {
    const {
      classes,
      mode,
      onChangeRoute,
      onUpdateInputLang,
      onUpdateOutputLang,
      recentLanguages,
      search,
    } = this.props;

    const onLanguageClick = (value) => {
      if (mode === 'inputLang') {
        onUpdateInputLang(value);
      } else if (mode === 'outputLang') {
        onUpdateOutputLang(value);
      }

      if (mode && mode.startsWith('ocr')) {
        onChangeRoute(ROUTE_OCR);
      } else {
        onChangeRoute(ROUTE_HOME);
      }
    };

    const isSearch = search && search.length > 0;
    const normalizedSearch = isSearch ? search.toLowerCase() : null;

    return (
      <div className={classes.listContainer}>
        {!isSearch && (
          <>
            <List
              subheader={<ListSubheader disableSticky>{getLocale('recentlyUsed')}</ListSubheader>}
            >
              {recentLanguages.map((langId) => (
                <ListItem
                  button
                  key={`lang_recent_${langId}`}
                  onClick={() => onLanguageClick(langId)}
                >
                  <ListItemText primary={getLocale(langId)} />
                </ListItem>
              ))}
            </List>
            <Divider />
          </>
        )}
        <List
          subheader={<ListSubheader disableSticky>{isSearch ? getLocale('searchResults') : getLocale('allLanguages')}</ListSubheader>}
        >
          {langList.length < 1 ? (
            <ListItem
              button
              disabled
            >
              <ListItemText primary={getLocale('noLanguageFound')} />
            </ListItem>
          )
            : langList.map(({ id, locale }) => {
              if (isSearch && locale.toLowerCase().indexOf(normalizedSearch) < 0) return null;
              if (mode === 'outputLang' && id === 'auto') return null;

              return (
                <ListItem
                  button
                  key={`lang_${id}`}
                  onClick={() => onLanguageClick(id)}
                >
                  <ListItemText primary={locale} />
                </ListItem>
              );
            })}
        </List>
      </div>
    );
  }
}

LanguageListList.propTypes = {
  classes: PropTypes.object.isRequired,
  mode: PropTypes.string,
  onChangeRoute: PropTypes.func.isRequired,
  onUpdateInputLang: PropTypes.func.isRequired,
  onUpdateOutputLang: PropTypes.func.isRequired,
  recentLanguages: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
};

const actionCreators = {
  changeRoute,
  updateInputLang,
  updateOutputLang,
};

const mapStateToProps = (state) => ({
  mode: state.pages.languageList.mode,
  recentLanguages: state.preferences.recentLanguages,
  search: state.pages.languageList.search,
});

export default connectComponent(
  LanguageListList,
  mapStateToProps,
  actionCreators,
  styles,
);
