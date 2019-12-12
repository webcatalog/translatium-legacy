/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import { updateInputLang, updateOutputLang } from '../../../state/root/preferences/actions';
import { updateInputText } from '../../../state/pages/home/actions';

const styles = (theme) => ({
  container: {
    marginTop: 0,
    padding: 12,
  },
  inline: {
    display: 'inline',
  },
  divider: {
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    marginTop: 8,
    '&:not(:first-child)': {
      marginTop: 16,
    },
  },
  subheading: {
    marginTop: 8,
  },
  bold: {
    fontWeight: 600,
  },
  ul: {
    margin: 0,
  },
  link: {
    color: theme.palette.text.primary,
    outline: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

const Dictionary = ({
  classes,
  output,
  onUpdateInputLang,
  onUpdateInputText,
  onUpdateOutputLang,
}) => {
  const inputLang = output.inputLang;
  const outputLang = output.outputLang;

  const onLinkClick = (_inputLang, _outputLang, _inputText) => {
    onUpdateInputLang(_inputLang);
    onUpdateOutputLang(_outputLang);
    onUpdateInputText(_inputText);
  };

  return (
    <div className={classes.container}>
      {output.inputDict && (
        <div>
          {output.inputDict[1] && (
            <div key="definitions">
              <Typography variant="h6" align="left" className={classes.title}>
                {getLocale('definitions')}
              </Typography>
              {output.inputDict[1].map((x) => (
                <div key={`definition_section_${x[0]}`}>
                  <Typography variant="subtitle1" align="left" className={classes.subheading}>
                    {x[0]}
                  </Typography>
                  {x[1].map((y, v) => (
                    <div key={`definition_${y[0]}`}>
                      <Typography variant="body2" align="left">
                        <span>{v + 1}. </span>
                        <a
                          role="button"
                          tabIndex="0"
                          onClick={() => onLinkClick(inputLang, outputLang, y[0])}
                          className={classNames(classes.link, classes.bold)}
                        >
                          {y[0]}
                        </a>
                      </Typography>
                      {(y[2]) && (
                        <Typography variant="body2" align="left">
                          {'"'}
                          <a
                            role="button"
                            tabIndex="0"
                            onClick={() => onLinkClick(inputLang, outputLang, y[2])}
                            className={classes.link}
                          >
                            {y[2]}
                          </a>
                          {'"'}
                        </Typography>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <Divider className={classes.divider} />
            </div>
          )}
          {output.inputDict[0] && (
            <div key="synonyms">
              <Typography variant="h6" align="left" className={classes.title}>
                {getLocale('synonyms')}
              </Typography>
              {output.inputDict[0].map((x) => (
                <div key={`synonyms_section_${x[0]}`}>
                  <Typography variant="subtitle1" align="left" className={classes.subheading}>
                    {x[0]}
                  </Typography>
                  <ul className={classes.ul}>
                    {x[1].map((wl) => (
                      <li key={`synonyms_line_${wl.join('-')}`}>
                        {wl[0].map((word, k) => (
                          <Typography variant="body2" align="left" key={`synonyms_word_${word}`} className={classes.inline}>
                            {(k > 0) && (<span>, </span>)}
                            <a
                              role="button"
                              tabIndex="0"
                              onClick={() => onLinkClick(inputLang, outputLang, word)}
                              className={classes.link}
                            >
                              {word}
                            </a>
                          </Typography>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Divider className={classes.divider} />
            </div>
          )}
          {output.inputDict[2] && (
            <div key="examples">
              <Typography variant="h6" align="left" className={classes.title}>
                {getLocale('examples')}
              </Typography>
              <div>
                {output.inputDict[2][0].map((x, i) => {
                  const text = x[0].replace(/(<([^>]+)>)/ig, '');
                  return (
                    <div key={`example_${text}`}>
                      <Typography variant="body2" align="left">
                        <span>{i + 1}. </span>
                        <a
                          role="button"
                          tabIndex="0"
                          onClick={() => onLinkClick(inputLang, outputLang, text)}
                          className={classes.link}
                        >
                          {text}
                        </a>
                      </Typography>
                    </div>
                  );
                })}
              </div>
              <Divider className={classes.divider} />
            </div>
          )}
          {output.inputDict[3] && (
            <div key="seeAlso">
              <Typography variant="h6" align="left" className={classes.title}>
                {getLocale('seeAlso')}
              </Typography>
              <div>
                {output.inputDict[3].map((x) => (
                  <div key={x.join('')}>
                    <Typography variant="body2" align="left">
                      {x.map((y, j) => {
                        const text = y.replace(/(<([^>]+)>)/ig, '');
                        return (
                          <span key={`seeAlso_${text}`} style={{ display: 'inline' }}>
                            {(j > 0) && (<span>, </span>)}
                            <a
                              role="button"
                              tabIndex="0"
                              onClick={() => onLinkClick(inputLang, outputLang, text)}
                              className={classNames(classes.link, classes.bold)}
                            >
                              {text}
                            </a>
                          </span>
                        );
                      })}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {output.outputDict && (
        <div>
          <Divider className={classes.divider} />
          <Typography variant="h6" align="left" className={classes.title}>
            {getLocale('translations')}
          </Typography>
          {output.outputDict.map((x) => (
            <div key={x[0]}>
              <Typography variant="subtitle1" align="left" className={classes.subheading}>
                {x[0]}
              </Typography>
              {x[2].map((y, j) => (
                <div key={y[0]}>
                  <Typography variant="body2" align="left">
                    <span>{j + 1}. </span>
                    {y[4] && (<span>{y[4]} </span>)}
                    <a
                      role="button"
                      tabIndex="0"
                      onClick={() => onLinkClick(inputLang, outputLang, y[0])}
                      className={classNames(classes.link, classes.bold)}
                    >
                      {y[0]}
                    </a>
                  </Typography>
                  {y[1] && (
                    <Typography variant="body2" align="left" className={classes.inline}>
                      {y[1].map((meaning, k) => (
                        <span key={meaning}>
                          {(k > 0) && (<span>, </span>)}
                          <a
                            role="button"
                            tabIndex="0"
                            onClick={() => onLinkClick(outputLang, inputLang, meaning)}
                            className={classes.link}
                          >
                            {meaning}
                          </a>
                        </span>
                      ))}
                    </Typography>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Dictionary.propTypes = {
  classes: PropTypes.object.isRequired,
  output: PropTypes.object.isRequired,
  onUpdateInputLang: PropTypes.func.isRequired,
  onUpdateInputText: PropTypes.func.isRequired,
  onUpdateOutputLang: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  output: state.pages.home.output,
});

const actionCreators = {
  updateInputLang,
  updateOutputLang,
  updateInputText,
};

export default connectComponent(
  Dictionary,
  mapStateToProps,
  actionCreators,
  styles,
);
