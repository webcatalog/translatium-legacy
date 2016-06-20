import React from 'react';
import { connect } from 'react-redux';

import i18n from '../../i18n';

import { materialDesignColors } from '../../constants/colors';

import { translateWithInfo } from '../../actions/home';

const Dictionary = ({
  primaryColorId, inputLang, outputLang,
  inputDict, outputDict,
  onLinkClick,
}) => (
  <div>
    {inputDict ? (
      <div className="app-content app-dictionary">
        {(inputDict[1]) ? (
          <div key="definitions" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{
                backgroundColor: materialDesignColors[primaryColorId].light,
              }}
            >
              {i18n('definitions')}
            </div>
            {inputDict[1].map((x, i) => (
              <div className="app-sub-section" key={`definitionSubSection${i}`}>
                <div
                  className="app-sub-section-title"
                  style={{
                    backgroundColor: materialDesignColors[primaryColorId].light,
                  }}
                >
                  {i18n(x[0])}
                </div>
                {x[1].map((y, j) => (
                  <div className="app-item" key={`definitionItem${j}`}>
                    <h5 className="win-h5">
                      <span>{j + 1}. </span>
                      <span
                        className="app-link"
                        onClick={() => onLinkClick(inputLang, outputLang, y[0])}
                      >
                        {y[0]}
                      </span>
                    </h5>
                    {(y[2]) ? (
                      <h6 className="win-h6">
                        <span>"</span>
                        <span
                          className="app-item-secondary-word app-link"
                          onClick={() => onLinkClick(inputLang, outputLang, y[2])}
                        >
                          {y[2]}
                        </span>
                        <span>"</span>
                      </h6>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {(inputDict[0]) ? (
          <div key="synonyms" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{
                backgroundColor: materialDesignColors[primaryColorId].light,
              }}
            >
              {i18n('synonyms')}
            </div>
            {inputDict[0].map((x, i) => (
              <div className="app-sub-section" key={`synonymSubSection${i}`}>
                <div
                  className="app-sub-section-title"
                  style={{
                    backgroundColor: materialDesignColors[primaryColorId].light,
                  }}
                >
                  {i18n(x[0])}
                </div>
                <ul className="app-list">
                  {x[1].map((wl, j) => (
                    <li className="win-h6" key={`synonymLi${j}`}>
                      {wl[0].map((word, k) => (
                        <span key={`synonymSpan${k}`}>
                          {(k > 0) ? (<span>, </span>) : null}
                          <span
                            className="app-link win-h5"
                            onClick={() => onLinkClick(inputLang, outputLang, word)}
                          >
                            {word}
                          </span>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        {(inputDict[2]) ? (
          <div key="examples" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{
                backgroundColor: materialDesignColors[primaryColorId].light,
              }}
            >
              {i18n('examples')}
            </div>
            <div className="app-sub-section">
              {inputDict[2][0].map((x, i) => {
                let text = x[0].replace(/(<([^>]+)>)/ig, '');
                return (
                  <div className="app-item" key={`exampleItem${i}`}>
                    <h5 className="win-h5">
                      <span>{i + 1}. </span>
                      <span
                        className="app-link"
                        onClick={() => onLinkClick(inputLang, outputLang, text)}
                      >
                        {text}
                      </span>
                    </h5>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        {(inputDict[3]) ? (
          <div key="seeAlso" className="app-section">
            <div
              className="app-section-title win-h4"
              style={{
                backgroundColor: materialDesignColors[primaryColorId].light,
              }}
            >
              {i18n('see-also')}
            </div>
            <div className="app-sub-section">
              {inputDict[3].map((x, i) => (
                <div className="app-item" key={`seeAlsoItem${i}`}>
                  <h5 className="win-h5">
                    {x.map((y, j) => {
                      let text = y.replace(/(<([^>]+)>)/ig, '');
                      return (
                        <span key={`seeAlsoSpan${j}`}>
                          {(j > 0) ? (<span>, </span>) : null}
                          <span
                            className="app-link win-h5"
                            onClick={() => onLinkClick(inputLang, outputLang, text)}
                          >
                            {text}
                          </span>
                        </span>
                      );
                    })}
                  </h5>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    ) : null}

    {outputDict ? (
      <div className="app-content app-dictionary">
        <div className="app-section">
          <div
            className="app-section-title win-h4"
            style={{
              backgroundColor: materialDesignColors[primaryColorId].light,
            }}
          >
            {i18n('translations')}
          </div>
          {outputDict.map(x => (
            <div className="app-sub-section" key={x[0]}>
              <div
                className="app-sub-section-title"
                style={{
                  backgroundColor: materialDesignColors[primaryColorId].light,
                }}
              >
                {i18n(x[0])}
              </div>
              {x[2].map((y, j) => (
                <div className="app-item" key={`translationItem${j}`}>
                  <h5 className="win-h5">
                    <span>{j + 1}. </span>
                    <span
                      className="app-link"
                      onClick={() => onLinkClick(outputLang, inputLang, y[0])}
                    >
                      {y[0]}
                    </span>
                  </h5>
                  <h6 className="win-h6">
                    {y[1].map((meaning, k) => (
                      <span key={`meaningSpan${k}`}>
                        {(k > 0) ? (<span>, </span>) : null}
                        <span
                          className="app-link win-h5"
                          onClick={() => onLinkClick(outputLang, inputLang, meaning)}
                        >
                          {meaning}
                        </span>
                      </span>
                    ))}
                  </h6>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ) : null}
  </div>
);

Dictionary.propTypes = {
  primaryColorId: React.PropTypes.string.isRequired,
  inputLang: React.PropTypes.string.isRequired,
  outputLang: React.PropTypes.string.isRequired,
  inputDict: React.PropTypes.object,
  outputDict: React.PropTypes.object,
  onLinkClick: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  primaryColorId: state.settings.primaryColorId,
  inputLang: state.settings.inputLang,
  outputLang: state.settings.outputLang,
  inputDict: state.home.inputDict,
  outputDict: state.home.outputDict,
});

const mapDispatchToProps = (dispatch) => ({
  onLinkClick: (inputLang, outputLang, inputText) => {
    dispatch(translateWithInfo(inputLang, outputLang, inputText));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Dictionary);
