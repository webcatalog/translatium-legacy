import React from 'react';
import PropTypes from 'prop-types';

import Divider from 'material-ui/Divider';
import Typography from 'material-ui/Typography';

import connectComponent from '../../../helpers/connect-component';

import { updateInputLang, updateOutputLang } from '../../../state/root/settings/actions';
import { updateInputText } from '../../../state/pages/home/actions';

const styles = {
  container: {
    marginTop: 32,
  },
  inline: {
    display: 'inline',
  },
  divider: {
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  subheading: {
    marginTop: 8,
  },
};

const Dictionary = ({
  classes,
  output,
  strings,
  onLinkClick,
}) => {
  const inputLang = output.inputLang;
  const outputLang = output.outputLang;

  return (
    <div className={classes.container}>
      {output.inputDict && (
        <div>
          {output.inputDict[1] && (
            <div key="definitions">
              <Typography variant="title" align="left" className={classes.title}>
                {strings.definitions}
              </Typography>
              {output.inputDict[1].map(x => (
                <div key={`definition_section_${x[0]}`}>
                  <Typography variant="subheading" align="left" className={classes.subheading}>
                    {strings[x[0]]}
                  </Typography>
                  {x[1].map((y, v) => (
                    <div key={`definition_${y[0]}`}>
                      <Typography variant="body1" align="left">
                        <span>{v + 1}. </span>
                        <a
                          role="button"
                          tabIndex="0"
                          onClick={() => onLinkClick(inputLang, outputLang, y[0])}
                        >
                          {y[0]}
                        </a>
                      </Typography>
                      {(y[2]) && (
                        <h4>
                          {'"'}
                          <a
                            role="button"
                            tabIndex="0"
                            onClick={() => onLinkClick(inputLang, outputLang, y[2])}
                          >
                            {y[2]}
                          </a>
                          {'"'}
                        </h4>
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
              <Typography variant="title" align="left" className={classes.title}>
                {strings.synonyms}
              </Typography>
              {output.inputDict[0].map(x => (
                <div key={`synonyms_section_${x[0]}`}>
                  <Typography variant="subheading" align="left" className={classes.subheading}>
                    {strings[x[0]]}
                  </Typography>
                  <ul>
                    {x[1].map(wl => (
                      <li key={`synonyms_line_${wl.join('-')}`}>
                        {wl[0].map((word, k) => (
                          <Typography variant="body1" align="left" key={`synonyms_word_${word}`} className={classes.inline}>
                            {(k > 0) && (<span>, </span>)}
                            <a
                              role="button"
                              tabIndex="0"
                              onClick={() => onLinkClick(inputLang, outputLang, word)}
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
              <Typography variant="title" align="left" className={classes.title}>
                {strings.examples}
              </Typography>
              <div>
                {output.inputDict[2][0].map((x, i) => {
                  const text = x[0].replace(/(<([^>]+)>)/ig, '');
                  return (
                    <div key={`example_${text}`}>
                      <Typography variant="body1" align="left">
                        <span>{i + 1}. </span>
                        <a
                          role="button"
                          tabIndex="0"
                          onClick={() => onLinkClick(inputLang, outputLang, text)}
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
              <Typography variant="title" align="left" className={classes.title}>
                {strings.seeAlso}
              </Typography>
              <div>
                {output.inputDict[3].map(x => (
                  <div key={x.join('')}>
                    <Typography variant="body1" align="left">
                      {x.map((y, j) => {
                        const text = y.replace(/(<([^>]+)>)/ig, '');
                        return (
                          <span key={`seeAlso_${text}`} style={{ display: 'inline' }}>
                            {(j > 0) && (<span>, </span>)}
                            <a
                              role="button"
                              tabIndex="0"
                              onClick={() => onLinkClick(inputLang, outputLang, text)}
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
          <Typography variant="title" align="left" className={classes.title}>
            {strings.translations}
          </Typography>
          {output.outputDict.map(x => (
            <div key={x[0]}>
              <Typography variant="subheading" align="left" className={classes.subheading}>
                {strings[x[0]]}
              </Typography>
              {x[2].map((y, j) => (
                <div key={y[0]}>
                  <Typography variant="body1" align="left">
                    <span>{j + 1}. </span>
                    {y[4] && (<span>{y[4]} </span>)}
                    <a
                      role="button"
                      tabIndex="0"
                      onClick={() => onLinkClick(inputLang, outputLang, y[0])}
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
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  strings: state.strings,
});

const mapDispatchToProps = dispatch => ({
  onLinkClick: (inputLang, outputLang, inputText) => {
    dispatch(updateInputLang(inputLang));
    dispatch(updateOutputLang(outputLang));
    dispatch(updateInputText(inputText));
  },
});

export default connectComponent(
  Dictionary,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
