import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Typography from '@material-ui/core/Typography';

import connectComponent from '../../../helpers/connect-component';

import { updateInputLang, updateOutputLang } from '../../../state/root/preferences/actions';
import { updateInputText } from '../../../state/pages/home/actions';

const styles = theme => ({
  container: {
    marginTop: 0,
  },
  inline: {
    display: 'inline',
  },
  subheading: {
    marginTop: 8,
    '&:not(:first-child)': {
      marginTop: 16,
    },
  },
  primary: {
    color: theme.palette.text.primary,
  },
  light: {
    color: theme.palette.text.secondary,
  },
  lighter: {
    color: theme.palette.text.disabled,
    fontStyle: 'italic',
  },
  link: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

const Dictionary = ({
  classes,
  output,
  onLinkClick,
}) => {
  const inputLang = output.inputLang;
  const outputLang = output.outputLang;
  const isSingleLangDict = output.outputDict.lang === `${output.inputLang}-${output.inputLang}`;

  const translateForward = text => onLinkClick(inputLang, outputLang, text);
  const translateBackward = (text) => {
    // Cannot translate forward if the dict is single lang (en-en)
    if (isSingleLangDict) {
      return translateForward(text);
    }
    return onLinkClick(outputLang, inputLang, text);
  };

  return (
    <div className={classes.container}>
      {output.outputDict.def.map(section => (
        <React.Fragment key={`dict_section${section.text}${section.pos}}`}>
          <Typography variant="subheading" align="left" className={classes.subheading}>
            <span
              className={classNames(classes.link, classes.primary)}
              role="button"
              tabIndex="0"
              onClick={() => translateForward(section.text)}
            >
              {section.text}
            </span>
            {section.ts && (
              <span className={classes.light}>
                &nbsp;[
                {section.ts}
                ]
              </span>
            )}
            {section.pos && (
              <span className={classes.lighter}>
                &nbsp;
                {section.pos}
              </span>
            )}
          </Typography>
          {section.tr.map((sSection, i) => (
            <React.Fragment>
              <Typography variant="body1" align="left">
                <span className={classes.light}>
                  {i + 1}
                  .&nbsp;
                </span>
                <span
                  className={classNames(classes.link, classes.primary)}
                  role="button"
                  tabIndex="0"
                  onClick={() => translateBackward(sSection.text)}
                >
                  {sSection.text}
                </span>
                {sSection.gen && (
                  <span className={classes.light}>
                    &nbsp;
                    {sSection.gen}
                  </span>
                )}
                {sSection.syn && sSection.syn.map(syn => (
                  <React.Fragment>
                    ,&nbsp;
                    <span
                      className={classNames(classes.link, classes.primary)}
                      role="button"
                      tabIndex="0"
                      onClick={() => translateBackward(syn.text)}
                    >
                      {syn.text}
                    </span>
                    {syn.gen && (
                      <span className={classes.light}>
                        &nbsp;
                        {syn.gen}
                      </span>
                    )}
                  </React.Fragment>
                ))}
                {sSection.mean && (
                  <React.Fragment>
                    &nbsp;(
                    {sSection.mean.map((mean, j) => (
                      <React.Fragment>
                        {j > 0 && <span>,&nbsp;</span>}
                        <span
                          className={classNames(classes.link, classes.light)}
                          role="button"
                          tabIndex="0"
                          onClick={() => translateForward(mean.text)}
                        >
                          {mean.text}
                        </span>
                        {mean.gen && (
                          <span className={classes.light}>
                            &nbsp;
                            {mean.gen}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                    )
                  </React.Fragment>
                )}
                .
              </Typography>
              {sSection.ex && sSection.ex.map((ex, j) => (
                <Typography variant="body1" align="left">
                  <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <span className={classes.light}>
                    {(j + 10).toString(36)}
                    .&nbsp;
                  </span>
                  <span
                    className={classNames(classes.link, classes.primary)}
                    role="button"
                    tabIndex="0"
                    onClick={() => translateBackward(ex.text)}
                  >
                    {ex.text}
                  </span>
                  {ex.tr && (
                    <React.Fragment>
                      &nbsp;(
                      {ex.tr.map(tr => (
                        <span
                          className={classNames(classes.link, classes.light)}
                          role="button"
                          tabIndex="0"
                          onClick={() => translateForward(ex.text)}
                        >
                          {tr.text}
                        </span>
                      ))}
                      )
                    </React.Fragment>
                  )}
                </Typography>
              ))}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

Dictionary.propTypes = {
  classes: PropTypes.object.isRequired,
  output: PropTypes.object.isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onLinkClick: (inputLang, outputLang, inputText) => {
    dispatch(updateInputLang(inputLang));
    dispatch(updateOutputLang(outputLang));
    dispatch(updateInputText(inputText));
  },
});

export default connectComponent(
  Dictionary,
  null,
  mapDispatchToProps,
  styles,
);
