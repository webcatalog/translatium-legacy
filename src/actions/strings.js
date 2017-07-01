import { UPDATE_STRINGS } from '../constants/actions';

import fetchLocal from '../libs/fetchLocal';

export const updateStrings = langId => (dispatch) => {
  let strings;

  const p = [];

  p.push(
    fetchLocal(`${process.env.PUBLIC_URL}/strings/${langId}.app.json`)
      .then(res => res.json())
      .then((res) => {
        strings = Object.assign({}, strings, res);
      }),
  );

  p.push(
    fetchLocal(`${process.env.PUBLIC_URL}/strings/${langId}.languages.json`)
      .then(res => res.json())
      .then((res) => {
        strings = Object.assign({}, strings, res);
      }),
  );

  return Promise.all(p)
    .then(() => dispatch({
      type: UPDATE_STRINGS,
      strings,
    }));
};
