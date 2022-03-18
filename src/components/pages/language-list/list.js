/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* global */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import getLocale from '../../../helpers/get-locale';

import { translate } from '../../../state/pages/home/actions';
import { changeRoute } from '../../../state/root/router/actions';
import { updateInputLang, updateOutputLang } from '../../../state/root/preferences/actions';
import { ROUTE_HOME } from '../../../constants/routes';

import { getLanguages } from '../../../helpers/language-utils';

const useStyles = makeStyles((theme) => ({
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    color: theme.palette.text.primary,
  },
}));

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

const LanguageListList = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const mode = useSelector((state) => state.pages.languageList.mode);
  const recentLanguages = useSelector((state) => state.preferences.recentLanguages);
  const search = useSelector((state) => state.pages.languageList.search);

  const onLanguageClick = (value) => {
    if (mode === 'inputLang') {
      dispatch(updateInputLang(value));
      dispatch(translate(value));
    } else if (mode === 'outputLang') {
      dispatch(updateOutputLang(value));
      dispatch(translate(null, value));
    }

    dispatch(changeRoute(ROUTE_HOME));
  };

  const isSearch = search && search.length > 0;
  const normalizedSearch = isSearch ? search.toLowerCase() : null;

  const filteredLangList = langList.filter(({ id, locale }) => {
    if (isSearch && locale.toLowerCase().indexOf(normalizedSearch) < 0) return false;
    if (mode === 'outputLang' && id === 'auto') return false;
    return true;
  });

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
        {filteredLangList.length < 1 ? (
          <ListItem
            button
            disabled
          >
            <ListItemText primary={getLocale('noLanguageFound')} />
          </ListItem>
        )
          : filteredLangList.map(({ id, locale }) => (
            <ListItem
              button
              key={`lang_${id}`}
              onClick={() => onLanguageClick(id)}
            >
              <ListItemText primary={locale} />
            </ListItem>
          ))}
      </List>
    </div>
  );
};

export default LanguageListList;
