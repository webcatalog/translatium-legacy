import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Typography from '@material-ui/core/Typography';
import MLink from '@material-ui/core/Link';

import connectComponent from '../../../helpers/connect-component';

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
});

const Dictionary = ({
  classes,
  onUpdateInputLang,
  onUpdateInputText,
  onUpdateOutputLang,
  output,
}) => {
  const inputLang = output.inputLang;
  const outputLang = output.outputLang;
  const isSingleLangDict = output.outputDict.lang === `${output.inputLang}-${output.inputLang}`;

  const onLinkClick = (_inputLang, _outputLang, _inputText) => {
    onUpdateInputLang(_inputLang);
    onUpdateOutputLang(_outputLang);
    onUpdateInputText(_inputText);
  };

  const translateForward = (text) => onLinkClick(inputLang, outputLang, text);
  const translateBackward = (text) => {
    // Cannot translate forward if the dict is single lang (en-en)
    if (isSingleLangDict) {
      return translateForward(text);
    }
    return onLinkClick(outputLang, inputLang, text);
  };

  return (
    <div className={classes.container}>
      {output.outputDict.def.map((section) => (
        <React.Fragment key={`dict_section${section.text}${section.pos}}`}>
          <Typography variant="subtitle1" align="left" className={classes.subheading}>
            <MLink
              component="button"
              variant="body1"
              className={classNames(classes.link, classes.primary)}
              onClick={() => translateForward(section.text)}
            >
              {section.text}
            </MLink>
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
            <React.Fragment key={sSection.text}>
              <Typography variant="body2" align="left">
                <span className={classes.light}>
                  {i + 1}
                  .&nbsp;
                </span>
                <MLink
                  component="button"
                  variant="body2"
                  className={classNames(classes.link, classes.primary)}
                  onClick={() => translateBackward(sSection.text)}
                >
                  {sSection.text}
                </MLink>
                {sSection.gen && (
                  <span className={classes.light}>
                    &nbsp;
                    {sSection.gen}
                  </span>
                )}
                {sSection.syn && sSection.syn.map((syn) => (
                  <React.Fragment key={syn.text}>
                    ,&nbsp;
                    <MLink
                      component="button"
                      variant="body2"
                      className={classNames(classes.link, classes.primary)}
                      onClick={() => translateBackward(syn.text)}
                    >
                      {syn.text}
                    </MLink>
                    {syn.gen && (
                      <span className={classes.light}>
                        &nbsp;
                        {syn.gen}
                      </span>
                    )}
                  </React.Fragment>
                ))}
                {sSection.mean && (
                  <>
                    &nbsp;(
                    {sSection.mean.map((mean, j) => (
                      <React.Fragment key={mean.text}>
                        {j > 0 && <span>,&nbsp;</span>}
                        <MLink
                          component="button"
                          variant="body2"
                          className={classNames(classes.link, classes.light)}
                          onClick={() => translateForward(mean.text)}
                        >
                          {mean.text}
                        </MLink>
                        {mean.gen && (
                          <span className={classes.light}>
                            &nbsp;
                            {mean.gen}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                    )
                  </>
                )}
                .
              </Typography>
              {sSection.ex && sSection.ex.map((ex, j) => (
                <Typography variant="body2" align="left" key={ex.text}>
                  <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <span className={classes.light}>
                    {(j + 10).toString(36)}
                    .&nbsp;
                  </span>
                  <MLink
                    component="button"
                    variant="body2"
                    className={classes.link}
                    onClick={() => translateBackward(ex.text)}
                  >
                    {ex.text}
                  </MLink>
                  {ex.tr && (
                    <>
                      &nbsp;(
                      {ex.tr.map((tr) => (
                        <MLink
                          component="button"
                          variant="body2"
                          className={classNames(classes.link, classes.light)}
                          onClick={() => translateForward(ex.text)}
                        >
                          {tr.text}
                        </MLink>
                      ))}
                      )
                    </>
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
};

export default connectComponent(
  Dictionary,
  mapStateToProps,
  actionCreators,
  styles,
);
