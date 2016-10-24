/* global strings */
import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import Divider from 'material-ui/Divider';

import { updateInputLang, updateOutputLang } from '../actions/settings';
import { updateInputText } from '../actions/home';

const Dictionary = ({
  output,
  onLinkTouchTap,
}) => {
  const inputLang = output.get('inputLang');
  const outputLang = output.get('outputLang');

  return (
    <div className="dictionary">
      {output.get('inputDict') ? (
        <div>
          {output.getIn(['inputDict', 1]) ? (
            <div key="definitions">
              <h1>{strings.definitions}</h1>
              {output.getIn(['inputDict', 1]).map((x, i) => (
                <div key={`definitionSubSection${i}`}>
                  <h2>{strings[x.get(0)]}</h2>
                  {x.get(1).map((y, v) => (
                    <div key={`definitionItem${v}`}>
                      <h3 style={{ display: 'inline' }}>
                        <span>{v + 1}. </span>
                        <a
                          onTouchTap={() => onLinkTouchTap(inputLang, outputLang, y.get(0))}
                        >
                          {y.get(0)}
                        </a>
                      </h3>
                      {(y.get(2)) ? (
                        <h4>
                          {'"'}
                          <a
                            onTouchTap={() => onLinkTouchTap(inputLang, outputLang, y.get(2))}
                          >
                            {y.get(2)}
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
          {output.getIn(['inputDict', 0]) ? (
            <div key="synonyms">
              <h1>{strings.synonyms}</h1>
              {output.getIn(['inputDict', 0]).map((x, i) => (
                <div key={`synonymSubSection${i}`}>
                  <h2>{strings[x.get(0)]}</h2>
                  <ul>
                    {x.get(1).map((wl, j) => (
                      <li key={`synonymLi${j}`}>
                        {wl.get(0).map((word, k) => (
                          <h3 key={`synonymSpan${k}`} style={{ display: 'inline' }}>
                            {(k > 0) ? (<span>, </span>) : null}
                            <a
                              onTouchTap={() => onLinkTouchTap(inputLang, outputLang, word)}
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
          {output.getIn(['inputDict', 2]) ? (
            <div key="examples">
              <h1>{strings.examples}</h1>
              <div>
                {output.getIn(['inputDict', 2, 0]).map((x, i) => {
                  const text = x.get(0).replace(/(<([^>]+)>)/ig, '');
                  return (
                    <div key={`exampleItem${i}`}>
                      <h3>
                        <span>{i + 1}. </span>
                        <a
                          onTouchTap={() => onLinkTouchTap(inputLang, outputLang, text)}
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
          {output.getIn(['inputDict', 3]) ? (
            <div key="seeAlso">
              <h1>{strings.seeAlso}</h1>
              <div>
                {output.getIn(['inputDict', 3]).map((x, i) => (
                  <div key={`seeAlsoItem${i}`}>
                    <h3>
                      {x.map((y, j) => {
                        const text = y.replace(/(<([^>]+)>)/ig, '');
                        return (
                          <span key={`seeAlsoSpan${j}`} style={{ display: 'inline' }}>
                            {(j > 0) ? (<span>, </span>) : null}
                            <a
                              onTouchTap={() => onLinkTouchTap(inputLang, outputLang, text)}
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

      {output.get('outputDict') ? (
        <div>
          <Divider />
          <h1>{strings.translations}</h1>
          {output.get('outputDict').map(x => (
            <div key={x.get(0)}>
              <h2>{strings[x.get(0)]}</h2>
              {x.get(2).map((y, j) => (
                <div key={`translationItem${j}`}>
                  <h3>
                    <span>{j + 1}. </span>
                    <a
                      onTouchTap={() => onLinkTouchTap(inputLang, outputLang, y.get(0))}
                    >
                      {y.get(0)}
                    </a>
                  </h3>
                  <h4 style={{ display: 'inline' }}>
                    {y.get(1).map((meaning, k) => (
                      <span key={`meaningSpan${k}`}>
                        {(k > 0) ? (<span>, </span>) : null}
                        <a
                          onTouchTap={() => onLinkTouchTap(outputLang, inputLang, meaning)}
                        >
                          {meaning}
                        </a>
                      </span>
                    ))}
                  </h4>
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
  output: React.PropTypes.instanceOf(Immutable.Map),
  onLinkTouchTap: React.PropTypes.func,
};

const mapDispatchToProps = dispatch => ({
  onLinkTouchTap: (inputLang, outputLang, inputText) => {
    dispatch(updateInputLang(inputLang));
    dispatch(updateOutputLang(outputLang));
    dispatch(updateInputText(inputText));
  },
});

export default connect(
  null, mapDispatchToProps
)(Dictionary);
