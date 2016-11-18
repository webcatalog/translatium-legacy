/* global strings */
import React from 'react';
import { connect } from 'react-redux';
import onTouchTapOutside from 'react-onclickoutside';

import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import FlatButton from 'material-ui/FlatButton';

import { updateInputText, updateImeMode } from '../actions/home';
import { loadSuggestions, resetSuggestions } from '../actions/handwriting';
import insertAtCursor from '../libs/insertAtCursor';
import deleteAtCursor from '../libs/deleteAtCursor';

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
    this.onDeleteButtonTouchTap = this.onDeleteButtonTouchTap.bind(this);
    this.onSpaceBarButtonTouchTap = this.onSpaceBarButtonTouchTap.bind(this);
    this.onDoneButtonTouchTap = this.onDoneButtonTouchTap.bind(this);
    this.onSuggestionsItemTouchTap = this.onSuggestionsItemTouchTap.bind(this);
  }


  componentDidMount() {
    const canvas = this.canvas;
    const { onResetSuggestions } = this.props;
    const { textColor } = this.context.muiTheme.palette;
    this.canvasContext = canvas.getContext('2d');
    this.canvasContext.canvas.height = canvas.clientHeight;
    this.canvasContext.canvas.width = canvas.clientWidth;
    this.canvasContext.strokeStyle = textColor;
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
    const titleBarHeight = (process.env.PLATFORM === 'mac') ? 22 : 0;
    this.addTouchTap(pageX - this.offsetLeft, pageY - this.offsetTop - titleBarHeight);
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

      const titleBarHeight = (process.env.PLATFORM === 'mac') ? 22 : 0;

      this.addTouchTap(pageX - this.offsetLeft, pageY - this.offsetTop - titleBarHeight, true);
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

  onDeleteButtonTouchTap() {
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

  onSpaceBarButtonTouchTap() {
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

  onDoneButtonTouchTap() {
    this.clearCanvas();
  }

  onSuggestionsItemTouchTap(rText) {
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

  getStyles() {
    return {
      container: {
        position: 'absolute',
        width: '100%',
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
    };
  }


  handleClickOutside() {
    const { onTurnOffHandwriting } = this.props;
    onTurnOffHandwriting();
  }

  addTouchTap(x, y, dragging) {
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
    const styles = this.getStyles();

    const suggestions = this.props.suggestions
                        || [',', '.', '?', '!', ':', '\'', '"', ';', '@'];

    const {
      onDeleteButtonTouchTap, onSpaceBarButtonTouchTap, onDoneButtonTouchTap,
      onSuggestionsItemTouchTap,
      onMouseUp, onMouseDown, onMouseLeave, onMouseMove,
    } = this;

    return (
      <Paper zDepth={2} style={styles.container}>
        <div style={styles.wrapper}>
          {suggestions.map((suggestion, i) => (
            <Chip
              key={i}
              style={styles.suggestionItem}
              onTouchTap={() => onSuggestionsItemTouchTap(suggestion)}
            >
              {suggestion}
            </Chip>
          ))}
        </div>
        <canvas
          style={styles.canvas}
          ref={(c) => { this.canvas = c; }}
          onMouseUp={onMouseUp}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          onTouchEnd={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
        />
        <div style={styles.wrapper}>
          <FlatButton label={strings.delete} secondary onTouchTap={onDeleteButtonTouchTap} />
          <FlatButton label={strings.spaceBar} onTouchTap={onSpaceBarButtonTouchTap} />
          <FlatButton label={strings.done} primary onTouchTap={onDoneButtonTouchTap} />
        </div>
      </Paper>
    );
  }
}

Handwriting.propTypes = {
  screenWidth: React.PropTypes.number,
  inputText: React.PropTypes.string,
  selectionStart: React.PropTypes.number,
  selectionEnd: React.PropTypes.number,
  suggestions: React.PropTypes.arrayOf(React.PropTypes.string),
  onUpdateInputText: React.PropTypes.func,
  onLoadSuggestions: React.PropTypes.func,
  onResetSuggestions: React.PropTypes.func,
  onTurnOffHandwriting: React.PropTypes.func,
};

Handwriting.contextTypes = {
  muiTheme: React.PropTypes.object,
};

const mapDispatchToProps = dispatch => ({
  onUpdateInputText: (inputText, selectionStart, selectionEnd) => {
    dispatch(updateInputText(inputText, selectionStart, selectionEnd));
  },
  onLoadSuggestions: (inputInk, canvasHeight, canvasWidth) => {
    dispatch(loadSuggestions(inputInk, canvasWidth, canvasHeight));
  },
  onResetSuggestions: () => {
    dispatch(resetSuggestions());
  },
  onTurnOffHandwriting: () => {
    dispatch(updateImeMode(null));
  },
});

const mapStateToProps = (state) => {
  let eventTypes;
  /* global Windows */
  /* mousedown & touchstart call at the same time on WIndows Mobile. */
  /* Workaround: disable mousedown on touch, disable touch on Continuum */
  if ((process.env.PLATFORM === 'windows') && (Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily === 'Windows.Mobile')) {
    switch (Windows.UI.ViewManagement.UIViewSettings.getForCurrentView().userInteractionMode) {
      case Windows.UI.ViewManagement.UserInteractionMode.mouse: {
        eventTypes = 'mousedown';
        break;
      }
      case Windows.UI.ViewManagement.UserInteractionMode.touch: {
        eventTypes = 'touchstart';
        break;
      }
      default: {
        break;
      }
    }
  }

  return {
    inputText: state.home.inputText,
    selectionStart: state.home.selectionStart,
    selectionEnd: state.home.selectionEnd,
    suggestions: state.handwriting.suggestions,
    eventTypes,
  };
};

export default connect(
  mapStateToProps, mapDispatchToProps,
)(onTouchTapOutside(Handwriting));
