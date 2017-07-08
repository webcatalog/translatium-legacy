import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shortid from 'shortid';

import { withStyles, createStyleSheet } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import Button from 'material-ui/Button';

import { updateInputText, updateImeMode } from '../../actions/home';
import { loadSuggestions, resetSuggestions } from '../../actions/handwriting';

import getPlatform from '../../libs/getPlatform';
import insertAtCursor from '../../libs/insertAtCursor';
import deleteAtCursor from '../../libs/deleteAtCursor';

const styleSheet = createStyleSheet('Handwriting', {
  container: {
    position: 'absolute',
    width: '100vw',
    height: 240,
    zIndex: 1499,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: 4,
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  suggestionItem: {
    marginLeft: 4,
  },
  canvas: {
    flex: 1,
  },
});

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
    this.onSuggestionsItemClick = this.onSuggestionsItemClick.bind(this);
  }


  componentDidMount() {
    const canvas = this.canvas;
    const { darkMode, onResetSuggestions } = this.props;
    this.canvasContext = canvas.getContext('2d');
    this.canvasContext.canvas.height = canvas.clientHeight;
    this.canvasContext.canvas.width = canvas.clientWidth;
    this.canvasContext.strokeStyle = darkMode ? '#fff' : '#000';
    this.canvasContext.lineJoin = 'round';
    this.canvasContext.lineWidth = 5;
    this.offsetTop = canvas.offsetParent.offsetTop + canvas.offsetTop;
    this.offsetLeft = canvas.offsetParent.offsetLeft + canvas.offsetLeft;

    onResetSuggestions();
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
    const titleBarHeight = (getPlatform() === 'electron') ? 22 : 0;
    this.addClick(pageX - this.offsetLeft, pageY - this.offsetTop - titleBarHeight);
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

      const titleBarHeight = (getPlatform() === 'electron') ? 22 : 0;

      this.addClick(pageX - this.offsetLeft, pageY - this.offsetTop - titleBarHeight, true);
    }
  }

  onMouseUp() {
    const { onLoadSuggestions } = this.props;

    this.paint = false;
    this.clickInk.push([this.clickX, this.clickY, this.clickZ]);
    this.clickX = [];
    this.clickY = [];
    this.clickZ = [];

    onLoadSuggestions(
      this.clickInk,
      this.canvasContext.canvas.height,
      this.canvasContext.canvas.width,
    );
  }

  onMouseLeave() {
    this.paint = false;
  }

  onDeleteButtonClick() {
    const {
      suggestions,
      selectionStart,
      selectionEnd,
      inputText,
      onUpdateInputText,
    } = this.props;

    const deletedText = deleteAtCursor(
      inputText,
      (suggestions) ? suggestions[0].length : 1,
      selectionStart,
      selectionEnd,
    );

    onUpdateInputText(
      deletedText.text,
      deletedText.selectionStart,
      deletedText.selectionEnd,
    );

    this.clearCanvas();
  }

  onSpaceBarButtonClick() {
    const { inputText, selectionStart, selectionEnd, onUpdateInputText } = this.props;

    const insertedText = insertAtCursor(
      inputText,
      ' ',
      selectionStart,
      selectionEnd,
    );

    onUpdateInputText(
      insertedText.text,
      insertedText.selectionStart,
      insertedText.selectionEnd,
    );

    this.clearCanvas();
  }

  onDoneButtonClick() {
    this.clearCanvas();
  }

  onSuggestionsItemClick(rText) {
    const { suggestions, inputText, selectionStart, selectionEnd, onUpdateInputText } = this.props;
    const deletedText = deleteAtCursor(
      inputText,
      suggestions ? suggestions[0].length : 0,
      selectionStart,
      selectionEnd,
    );

    const insertedText = insertAtCursor(
      deletedText.text,
      rText,
      deletedText.selectionStart,
      deletedText.selectionEnd,
    );

    onUpdateInputText(
      insertedText.text,
      insertedText.selectionStart,
      insertedText.selectionEnd,
    );

    this.clearCanvas();
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
    const { onResetSuggestions } = this.props;

    if (this.clickInk.length < 1) return;
    this.canvasContext.clearRect(
      0, 0,
      this.canvasContext.canvas.width,
      this.canvasContext.canvas.height,
    );
    this.clickInk = [];
    this.clickX = [];
    this.clickY = [];
    this.clickZ = [];
    this.clickDrag = [];
    this.startTime = new Date().getTime();
    this.paint = false;

    onResetSuggestions();
  }

  render() {
    const suggestions = this.props.suggestions
                        || [',', '.', '?', '!', ':', '\'', '"', ';', '@'];

    const {
      onDeleteButtonClick,
      onSpaceBarButtonClick,
      onDoneButtonClick,
      onSuggestionsItemClick,
      onMouseUp,
      onMouseDown,
      onMouseLeave,
      onMouseMove,
    } = this;

    const { classes, strings } = this.props;

    return (
      <Paper elevation={2} className={classes.container}>
        <div className={classes.wrapper}>
          {suggestions.map(suggestion => (
            <Chip
              key={shortid.generate()}
              label={suggestion}
              className={classes.suggestionItem}
              onClick={() => onSuggestionsItemClick(suggestion)}
            />
          ))}
        </div>
        <canvas
          className={classes.canvas}
          ref={(c) => { this.canvas = c; }}
          onMouseUp={onMouseUp}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          onTouchEnd={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
        />
        <div className={classes.wrapper}>
          <Button color="secondary" onClick={onDeleteButtonClick}>
            {strings.delete}
          </Button>
          <Button onClick={onSpaceBarButtonClick}>
            {strings.spaceBar}
          </Button>
          <Button color="primary" onClick={onDoneButtonClick}>
            {strings.done}
          </Button>
        </div>
      </Paper>
    );
  }
}

Handwriting.propTypes = {
  classes: PropTypes.object.isRequired,
  darkMode: PropTypes.bool.isRequired,
  inputText: PropTypes.string,
  onLoadSuggestions: PropTypes.func.isRequired,
  onResetSuggestions: PropTypes.func.isRequired,
  onTurnOffHandwriting: PropTypes.func.isRequired,
  onUpdateInputText: PropTypes.func.isRequired,
  screenWidth: PropTypes.number,
  selectionEnd: PropTypes.number,
  selectionStart: PropTypes.number,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string),
};

const mapDispatchToProps = dispatch => ({
  onUpdateInputText: (inputText, selectionStart, selectionEnd) =>
    dispatch(updateInputText(inputText, selectionStart, selectionEnd)),
  onLoadSuggestions: (inputInk, canvasHeight, canvasWidth) =>
    dispatch(loadSuggestions(inputInk, canvasWidth, canvasHeight)),
  onResetSuggestions: () => dispatch(resetSuggestions()),
  onTurnOffHandwriting: () => dispatch(updateImeMode(null)),
});

const mapStateToProps = state => ({
  darkMode: state.settings.darkMode,
  inputText: state.home.inputText,
  selectionEnd: state.home.selectionEnd,
  selectionStart: state.home.selectionStart,
  strings: state.strings,
  suggestions: state.handwriting.suggestions,
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(withStyles(styleSheet)(Handwriting));
