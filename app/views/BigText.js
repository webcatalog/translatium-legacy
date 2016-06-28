import React from 'react';
import { connect } from 'react-redux';

import Animation from './Animation';

import { updateSetting } from '../actions/settings';

class BigText extends React.Component {
  constructor(props) {
    super(props);

    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  handleSliderChange() {
    const { onSliderChange } = this.props;

    onSliderChange(this.refs.slider.value);
  }

  render() {
    const { outputText, bigTextFontSize } = this.props;
    const { handleSliderChange } = this;

    return (
      <Animation name="enterPage">
        <div className="app-big-text-page">
          <div
            className="app-content"
            style={{ fontSize: bigTextFontSize }}
          >
            {outputText}
          </div>
          <div className="app-toolbar">
            <input
              ref="slider"
              type="range"
              min={20}
              max={200}
              value={bigTextFontSize}
              onChange={handleSliderChange}
              className="win-slider"
            />
          </div>
        </div>
      </Animation>
    );
  }
}

BigText.propTypes = {
  outputText: React.PropTypes.string.isRequired,
  bigTextFontSize: React.PropTypes.number.isRequired,
  onSliderChange: React.PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  outputText: state.home.outputText,
  bigTextFontSize: state.settings.bigTextFontSize,
});

const mapDispatchToProps = (dispatch) => ({
  onSliderChange: (bigTextFontSize) => {
    dispatch(updateSetting('bigTextFontSize', parseInt(bigTextFontSize, 10)));
  },
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(BigText);
