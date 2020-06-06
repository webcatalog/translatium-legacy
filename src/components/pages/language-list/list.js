/* global */
import React from 'react';
import PropTypes from 'prop-types';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { translate } from '../../../state/pages/home/actions';
import { changeRoute } from '../../../state/root/router/actions';
import { updateInputLang, updateOutputLang } from '../../../state/root/preferences/actions';
import { ROUTE_HOME } from '../../../constants/routes';

import { getLanguages } from '../../../helpers/language-utils';

const styles = (theme) => ({
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    color: theme.palette.text.primary,
  },
});

const langList = getLanguages()
  .map((id) => ({
    id,
    locale: getLocale(id),
  }))
  .sort((x, y) => {
    if (x.id === 'auto') return -1;
    if (y.id === 'auto') return 1;
    return x.locale.localeCompare(y.locale);
  });


const LanguageListList = ({
  classes,
  mode,
  onChangeRoute,
  onTranslate,
  onUpdateInputLang,
  onUpdateOutputLang,
  recentLanguages,
  search,
}) => {
  const onLanguageClick = (value) => {
    if (mode === 'inputLang') {
      onUpdateInputLang(value);
      onTranslate(value);
    } else if (mode === 'outputLang') {
      onUpdateOutputLang(value);
      onTranslate(null, value);
    }

    onChangeRoute(ROUTE_HOME);
  };

  const isSearch = search && search.length > 0;
  const normalizedSearch = isSearch ? search.toLowerCase() : null;

  return (
    <div className={classes.listContainer}>
      {!isSearch && (
        <>
          <List
            dense
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
        dense
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
};

LanguageListList.propTypes = {
  classes: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  onChangeRoute: PropTypes.func.isRequired,
  onTranslate: PropTypes.func.isRequired,
  onUpdateInputLang: PropTypes.func.isRequired,
  onUpdateOutputLang: PropTypes.func.isRequired,
  recentLanguages: PropTypes.arrayOf(PropTypes.string).isRequired,
  search: PropTypes.string.isRequired,
};

const actionCreators = {
  changeRoute,
  translate,
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
