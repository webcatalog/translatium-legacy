import React from 'react';
import PropTypes from 'prop-types';
import { goBack } from 'react-router-redux';

import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import CloseIcon from 'material-ui-icons/Close';
import ZoomInIcon from 'material-ui-icons/ZoomIn';
import ZoomOutIcon from 'material-ui-icons/ZoomOut';

import connectComponent from '../../helpers/connect-component';

import { updateSetting } from '../../state/root/settings/actions';

const styles = {
  container: {
    flex: 1,
    padding: '16px 16px 16px 16px',
    boxSizing: 'border-box',
    overflow: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 100,
  },
  minusButton: {
    position: 'absolute',
    top: 16,
    left: 96,
    zIndex: 100,
  },
  plusButton: {
    position: 'absolute',
    top: 16,
    left: 176,
    zIndex: 100,
  },
  textContainer: {
    marginTop: 80,
    lineHeight: 'normal',
  },
};

const BiggerText = (props) => {
  const {
    biggerTextFontSize,
    classes,
    onCloseClick,
    onUpdateBiggerTextFontSize,
    text,
  } = props;

  return (
    <div className={classes.container}>
      <Button
        fab
        dense
        className={classes.closeButton}
        onClick={onCloseClick}
      >
        <CloseIcon />
      </Button>
      <Button
        fab
        dense
        className={classes.minusButton}
        onClick={() => {
          if (biggerTextFontSize < 10) return;
          onUpdateBiggerTextFontSize(biggerTextFontSize - 5);
        }}
      >
        <ZoomOutIcon />
      </Button>
      <Button
        fab
        dense
        className={classes.plusButton}
        onClick={() => onUpdateBiggerTextFontSize(biggerTextFontSize + 5)}
      >
        <ZoomInIcon />
      </Button>
      <Typography className={classes.textContainer} style={{ fontSize: biggerTextFontSize }}>
        {text}
      </Typography>
    </div>
  );
};

BiggerText.propTypes = {
  classes: PropTypes.object.isRequired,
  text: PropTypes.string,
  biggerTextFontSize: PropTypes.number,
  onCloseClick: PropTypes.func.isRequired,
  onUpdateBiggerTextFontSize: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  text: ownProps.location.query.text,
  biggerTextFontSize: state.settings.biggerTextFontSize,
});

const mapDispatchToProps = dispatch => ({
  onCloseClick: () => dispatch(goBack()),
  onUpdateBiggerTextFontSize: value => dispatch(updateSetting('biggerTextFontSize', value)),
});

export default connectComponent(
  BiggerText,
  mapStateToProps,
  mapDispatchToProps,
  styles,
);
