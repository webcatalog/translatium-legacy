import React from 'react';
import { connect } from 'react-redux';

import InputToolbar from './InputToolbar';
import InputBox from './InputBox';
import Suggestion from './Suggestion';
import OutputCard from './OutputCard';
import Handwriting from './Handwriting';

const Home = ({ inputExpanded, imeMode }) => (
  <div className={`app-home-page ${(inputExpanded) ? 'app-expanded' : ''}`}>
    <InputToolbar />
    <InputBox />
    <div className="app-translation-card-container">
      <Suggestion />
      <OutputCard />
    </div>
    {imeMode === 'handwriting' ? <Handwriting /> : null}
  </div>
);

Home.propTypes = {
  inputExpanded: React.PropTypes.bool.isRequired,
  imeMode: React.PropTypes.string,
};

const mapStateToProps = (state) => ({
  inputExpanded: state.home.inputExpanded,
  imeMode: state.home.imeMode,
});

export default connect(
  mapStateToProps
)(Home);
