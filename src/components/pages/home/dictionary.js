/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import MLink from '@material-ui/core/Link';

import connectComponent from '../../../helpers/connect-component';

import { updateInputLang, updateOutputLang } from '../../../state/root/preferences/actions';
import { updateInputText, translate } from '../../../state/pages/home/actions';

const styles = (theme) => ({
  container: {
    marginTop: 0,
    padding: 12,
  },
  inline: {
    display: 'inline',
  },
  pos: {
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    userSelect: 'text',
    '&:not(:first-child)': {
      marginTop: theme.spacing(4),
    },
  },
  word: {
    color: theme.palette.text.primary,
    lineHeight: 1.3,
    userSelect: 'text',
  },
  translations: {
    color: theme.palette.text.secondary,
    userSelect: 'text',
    '&:not(:last-child)': {
      marginBottom: theme.spacing(1.5),
    },
  },
  link: {
    color: 'inherit',
    userSelect: 'text',
  },
});

const Dictionary = ({
  classes,
  onTranslate,
  onUpdateInputLang,
  onUpdateInputText,
  onUpdateOutputLang,
  output,
}) => {
  const { inputLang, outputLang, outputDict } = output;

  const onLinkClick = (_inputLang, _outputLang, _inputText) => {
    onUpdateInputLang(_inputLang);
    onUpdateOutputLang(_outputLang);
    onUpdateInputText(_inputText);
    onTranslate(_inputLang, _outputLang, _inputText);
  };

  const translateForward = (text) => onLinkClick(inputLang, outputLang, text);
  const translateBackward = (text) => onLinkClick(outputLang, inputLang, text);

  return (
    <div className={classes.container}>
      {outputDict.map((section) => (
        <React.Fragment key={section.pos}>
          <Typography variant="h6" align="left" className={classes.pos}>
            {section.pos}
          </Typography>
          <div>
            {section.entry.map((entry) => (
              <React.Fragment key={entry.word}>
                <Typography variant="body1" align="left" className={classes.word}>
                  <MLink
                    component="button"
                    variant="body1"
                    className={classes.link}
                    onClick={() => translateBackward(entry.word)}
                  >
                    {entry.word}
                  </MLink>
                </Typography>
                <Typography variant="body2" align="left" className={classes.translations}>
                  {entry.reverse_translation.map((translation, i) => (
                    <React.Fragment key={translation}>
                      <MLink
                        component="button"
                        variant="body2"
                        className={classes.link}
                        onClick={() => translateForward(translation)}
                      >
                        {translation}
                      </MLink>
                      {i < entry.reverse_translation.length - 1 && (<span>, </span>)}
                    </React.Fragment>
                  ))}
                </Typography>
              </React.Fragment>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

Dictionary.propTypes = {
  classes: PropTypes.object.isRequired,
  onTranslate: PropTypes.func.isRequired,
  onUpdateInputLang: PropTypes.func.isRequired,
  onUpdateInputText: PropTypes.func.isRequired,
  onUpdateOutputLang: PropTypes.func.isRequired,
  output: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  output: state.pages.home.output,
});

const actionCreators = {
  updateInputLang,
  updateOutputLang,
  updateInputText,
  translate,
};

export default connectComponent(
  Dictionary,
  mapStateToProps,
  actionCreators,
  styles,
);
