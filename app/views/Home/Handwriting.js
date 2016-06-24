import React from 'react';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';

import i18n from '../../i18n';

import { materialDesignColors } from '../../constants/colors';

import { updateInputText, switchIme } from '../../actions/home';
import { loadSuggestionList, resetSuggestionList } from '../../actions/handwriting';

class Handwriting extends React.Component {
  constructor(props) {
    super(props);

    this.clickInk = [];
    this.clickX = [];
    this.clickY = [];
    this.clickZ = [];
    this.clickDrag = [];

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
    this.onSpaceBarButtonClick = this.onSpaceBarButtonClick.bind(this);
    this.onDoneButtonClick = this.onDoneButtonClick.bind(this);
    this.onSuggestionListItemClick = this.onSuggestionListItemClick.bind(this);
  }


  componentDidMount() {
    const { canvas } = this.refs;
    const { theme, onResetSuggestionList } = this.props;
    this.canvasContext = canvas.getContext('2d');
    this.canvasContext.canvas.height = canvas.clientHeight;
    this.canvasContext.canvas.width = canvas.clientWidth;
    this.canvasContext.strokeStyle = (theme === 'light') ? '#000' : '#fff';
    this.canvasContext.lineJoin = 'round';
    this.canvasContext.lineWidth = 5;
    this.offsetTop = canvas.offsetParent.offsetTop + canvas.offsetTop;
    this.offsetLeft = canvas.offsetParent.offsetLeft + canvas.offsetLeft;

    onResetSuggestionList();
  }

  componentWillUpdate(nextProps) {
    const { screenWidth, onTurnOffHandwriting } = this.props;

    if (screenWidth !== nextProps.screenWidth) {
      onTurnOffHandwriting();
    }
  }

  onMouseDown(e) {
    this.paint = true;
    let pageX;
    let pageY;
    if (e.type === 'touchstart') {
      const touch = e.touches[0];
      pageX = touch.pageX;
      pageY = touch.pageY;
    } else {
      pageX = e.pageX;
      pageY = e.pageY;
    }
    this.addClick(pageX - this.offsetLeft, pageY - this.offsetTop);
  }

  onMouseMove(e) {
    if (this.paint) {
      let pageX;
      let pageY;
      if (e.type === 'touchmove') {
        const touch = e.touches[0];
        pageX = touch.pageX;
        pageY = touch.pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }
      this.addClick(pageX - this.offsetLeft, pageY - this.offsetTop, true);
    }
  }

  onMouseUp() {
    const { onLoadSuggestionList } = this.props;

    this.paint = false;
    this.clickInk.push([this.clickX, this.clickY, this.clickZ]);
    this.clickX = [];
    this.clickY = [];
    this.clickZ = [];

    onLoadSuggestionList(
      this.clickInk,
      this.canvasContext.canvas.height,
      this.canvasContext.canvas.width
    );
  }

  onMouseLeave() {
    this.paint = false;
  }

  onDeleteButtonClick() {
    const { suggestionList, inputText, onUpdateInputText } = this.props;

    const delLength = (suggestionList) ? suggestionList[0].length : 1;

    if (inputText.length - delLength >= 0) {
      const newInputText = inputText.slice(0, -delLength);
      onUpdateInputText(newInputText);
    }

    this.clearCanvas();
  }

  onSpaceBarButtonClick() {
    const { inputText, onUpdateInputText } = this.props;

    onUpdateInputText(`${inputText} `);

    this.clearCanvas();
  }

  onDoneButtonClick() {
    this.clearCanvas();
  }

  onSuggestionListItemClick(rText) {
    const { suggestionList, inputText, onUpdateInputText } = this.props;

    let newInputText;
    if (suggestionList) {
      newInputText = inputText.slice(0, -suggestionList[0].length) + rText;
    } else {
      newInputText = inputText + rText;
    }

    onUpdateInputText(newInputText);

    this.clearCanvas();
  }

  handleClickOutside() {
    const { onTurnOffHandwriting } = this.props;
    onTurnOffHandwriting();
  }

  addClick(x, y, dragging) {
    this.clickX.push(Math.round(x));
    this.clickY.push(Math.round(y));
    this.clickDrag.push(dragging);
    const time = new Date().getTime();
    this.clickZ.push(time - this.startTime);
    const i = this.clickX.length - 1;
    this.canvasContext.beginPath();
    if (this.clickDrag[i] && i) {
      this.canvasContext.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
    } else {
      this.canvasContext.moveTo(this.clickX[i] - 1, this.clickY[i]);
    }
    this.canvasContext.lineTo(this.clickX[i], this.clickY[i]);
    this.canvasContext.closePath();
    this.canvasContext.stroke();
  }

  clearCanvas() {
    const { onResetSuggestionList } = this.props;

    if (this.clickInk.length < 1) return;
    this.canvasContext.clearRect(
      0, 0,
      this.canvasContext.canvas.width,
      this.canvasContext.canvas.height
    );
    this.clickInk = [];
    this.clickX = [];
    this.clickY = [];
    this.clickZ = [];
    this.clickDrag = [];
    this.startTime = new Date().getTime();
    this.paint = false;

    onResetSuggestionList();
  }

  render() {
    const {
      primaryColorId, screenWidth,
    } = this.props;

    const suggestionList = this.props.suggestionList
                        || [',', '.', '?', '!', ':', '\'', '"', ';', '@'];

    const {
      onDeleteButtonClick, onSpaceBarButtonClick, onDoneButtonClick,
      onSuggestionListItemClick,
      onMouseUp, onMouseDown, onMouseLeave, onMouseMove,
    } = this;

    return (
      <div className="app-write-control">
        <div
          className="app-list"
        >
          {suggestionList.map((suggestion, i) => (
            <div
              className="win-h4 app-item"
              key={i}
              onClick={() => onSuggestionListItemClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
        <canvas
          ref="canvas"
          className="app-canvas"
          onMouseUp={onMouseUp}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          onTouchEnd={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
        />
        <div className="app-control-container">
          <button
            className="win-button"
            onClick={onDeleteButtonClick}
          >
            {i18n('delete')}
          </button>
          <button
            className="win-button"
            style={{
              marginLeft: 6,
              width: 'calc(100% - 252px)',
              minWidth: 'auto',
            }}
            onClick={onSpaceBarButtonClick}
          >
            {(screenWidth < 600) ? '␣' : i18n('space-bar')}
          </button>
          <button
            className="win-button"
            style={{
              backgroundColor: materialDesignColors[primaryColorId].light,
              color: '#fff',
              marginLeft: 6,
            }}
            onClick={onDoneButtonClick}
          >
            {i18n('done')}
          </button>
        </div>
      </div>
    );
  }
}

Handwriting.propTypes = {
  theme: React.PropTypes.string.isRequired,
  primaryColorId: React.PropTypes.string.isRequired,
  screenWidth: React.PropTypes.number.isRequired,
  inputText: React.PropTypes.string.isRequired,
  suggestionList: React.PropTypes.array,
  onUpdateInputText: React.PropTypes.func.isRequired,
  onLoadSuggestionList: React.PropTypes.func.isRequired,
  onResetSuggestionList: React.PropTypes.func.isRequired,
  onTurnOffHandwriting: React.PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  onUpdateInputText: (inputText) => {
    dispatch(updateInputText(inputText));
  },
  onLoadSuggestionList: (inputInk, canvasHeight, canvasWidth) => {
    dispatch(loadSuggestionList(inputInk, canvasWidth, canvasHeight));
  },
  onResetSuggestionList: () => {
    dispatch(resetSuggestionList());
  },
  onTurnOffHandwriting: () => {
    dispatch(switchIme(null));
  },
});

const mapStateToProps = (state) => ({
  theme: state.settings.theme,
  primaryColorId: state.settings.primaryColorId,
  screenWidth: state.screen.screenWidth,
  inputText: state.home.inputText,
  suggestionList: state.handwriting.suggestionList,
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(onClickOutside(Handwriting));
