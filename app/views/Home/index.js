/* global Windows */

import React from 'react';
import { connect } from 'react-redux';

import InputToolbar from './InputToolbar';
import InputBox from './InputBox';
import Suggestion from './Suggestion';
import OutputCard from './OutputCard';
import Handwriting from './Handwriting';
import SpeechRecognition from './SpeechRecognition';

class Home extends React.Component {
  componentDidMount() {
    const { preventingScreenLock } = this.props;

    if (preventingScreenLock === true) {
      this.dispRequest = new Windows.System.Display.DisplayRequest();
      this.dispRequest.requestActive();
    }
  }

  componentWillUnmount() {
    if (this.dispRequest) {
      this.dispRequest.requestRelease();
    }
  }

  render() {
    const { inputExpanded, imeMode } = this.props;
    return (
      <div className={`app-home-page ${(inputExpanded) ? 'app-expanded' : ''}`}>
        <InputToolbar />
        <InputBox />
        <div className="app-translation-card-container">
          <Suggestion />
          <OutputCard />
        </div>
        {imeMode === 'handwriting' ? <Handwriting /> : null}
        {imeMode === 'speech' ? <SpeechRecognition /> : null}
      </div>
    );
  }
}

Home.propTypes = {
  preventingScreenLock: React.PropTypes.bool.isRequired,
  inputExpanded: React.PropTypes.bool.isRequired,
  imeMode: React.PropTypes.string,
};

const mapStateToProps = (state) => ({
  preventingScreenLock: state.settings.preventingScreenLock,
  inputExpanded: state.home.inputExpanded,
  imeMode: state.home.imeMode,
});

export default connect(
  mapStateToProps
)(Home);
