import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shortid from 'shortid';

import Divider from 'material-ui/Divider';

import { updateInputLang, updateOutputLang } from '../actions/settings';
import { updateInputText } from '../actions/home';

const Dictionary = ({
  output,
  strings,
  onLinkClick,
}) => {
  const inputLang = output.inputLang;
  const outputLang = output.outputLang;

  return (
    <div className="dictionary">
      {output.inputDict ? (
        <div>
          {output.inputDict[1] ? (
            <div key="definitions">
              <h1>{strings.definitions}</h1>
              {output.inputDict[1].map(x => (
                <div key={shortid.generate()}>
                  <h2>{strings[x[0]]}</h2>
                  {x[1].map((y, v) => (
                    <div key={shortid.generate()}>
                      <h3 style={{ display: 'inline' }}>
                        <span>{v + 1}. </span>
                        <a
                          role="button"
                          tabIndex="0"
                          onClick={() => onLinkClick(inputLang, outputLang, y[0])}
                        >
                          {y[0]}
                        </a>
                      </h3>
                      {(y[2]) ? (
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
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
          <Divider />
          {output.inputDict[0] ? (
            <div key="synonyms">
              <h1>{strings.synonyms}</h1>
              {output.inputDict[0].map(x => (
                <div key={shortid.generate()}>
                  <h2>{strings[x[0]]}</h2>
                  <ul>
                    {x[1].map(wl => (
                      <li key={shortid.generate()}>
                        {wl[0].map((word, k) => (
                          <h3 key={shortid.generate()} style={{ display: 'inline' }}>
                            {(k > 0) ? (<span>, </span>) : null}
                            <a
                              role="button"
                              tabIndex="0"
                              onClick={() => onLinkClick(inputLang, outputLang, word)}
                            >
                              {word}
                            </a>
                          </h3>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
          <Divider />
          {output.inputDict[2] ? (
            <div key="examples">
              <h1>{strings.examples}</h1>
              <div>
                {output.inputDict[2][0].map((x, i) => {
                  const text = x[0].replace(/(<([^>]+)>)/ig, '');
                  return (
                    <div key={shortid.generate()}>
                      <h3>
                        <span>{i + 1}. </span>
                        <a
                          role="button"
                          tabIndex="0"
                          onClick={() => onLinkClick(inputLang, outputLang, text)}
                        >
                          {text}
                        </a>
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <Divider />
          {output.inputDict[3] ? (
            <div key="seeAlso">
              <h1>{strings.seeAlso}</h1>
              <div>
                {output.inputDict[3].map(x => (
                  <div key={shortid.generate()}>
                    <h3>
                      {x.map((y, j) => {
                        const text = y.replace(/(<([^>]+)>)/ig, '');
                        return (
                          <span key={shortid.generate()} style={{ display: 'inline' }}>
                            {(j > 0) ? (<span>, </span>) : null}
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
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {output.outputDict ? (
        <div>
          <Divider />
          <h1>{strings.translations}</h1>
          {output.outputDict.map(x => (
            <div key={x[0]}>
              <h2>{strings[x[0]]}</h2>
              {x[2].map((y, j) => (
                <div key={shortid.generate()}>
                  <h3>
                    <span>{j + 1}. </span>
                    {y[4] ? (<span>{y[4]} </span>) : null}
                    <a
                      role="button"
                      tabIndex="0"
                      onClick={() => onLinkClick(inputLang, outputLang, y[0])}
                    >
                      {y[0]}
                    </a>
                  </h3>
                  {y[1] ? (
                    <h4 style={{ display: 'inline' }}>
                      {y[1].map((meaning, k) => (
                        <span key={shortid.generate()}>
                          {(k > 0) ? (<span>, </span>) : null}
                          <a
                            role="button"
                            tabIndex="0"
                            onClick={() => onLinkClick(outputLang, inputLang, meaning)}
                          >
                            {meaning}
                          </a>
                        </span>
                      ))}
                    </h4>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

Dictionary.propTypes = {
  // eslint-disable-next-line
  output: PropTypes.object,
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

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Dictionary);
