import React from 'react';
import { connect } from 'react-redux';

import InputToolbar from './InputToolbar';
import InputBox from './InputBox';
import Suggestion from './Suggestion';
import OutputCard from './OutputCard';

const Home = ({ inputExpanded }) => (
  <div className={`app-home-page ${(inputExpanded) ? 'app-expanded' : ''}`}>
    <InputToolbar />
    <InputBox />
    <div className="app-translation-card-container">
      <Suggestion />
      <OutputCard />
    </div>
  </div>
);

Home.propTypes = {
  inputExpanded: React.PropTypes.bool,
};

const mapStateToProps = (state) => ({
  inputExpanded: state.home.inputExpanded,
});

const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps, mapDispatchToProps
)(Home);
