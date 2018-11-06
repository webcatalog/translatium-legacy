/* global remote */
import React from 'react';
import PropTypes from 'prop-types';

import connectComponent from '../../helpers/connect-component';

const styles = theme => ({
  titlebar: {
    display: 'block',
    position: 'relative',
    height: 32,
    padding: 0,
    WebkitAppRegion: 'drag',
    backgroundColor: theme.palette.primary.dark,
    '&:after': {
      content: '\' \'',
      display: 'table',
      clear: 'both',
    },
  },
  titlebarControls: {
    float: 'right',
    textAlign: 'left',
    '&:after': {
      content: ' ',
      display: 'table',
      clear: 'both',
    },
  },
  titlebarButton: {
    float: 'left',
    width: 45,
    height: 31,
    margin: '1px 1px 0 0',
    textAlign: 'center',
    lineHeight: '29px',
    transition: 'background-color .2s',
    WebkitAppRegion: 'no-drag',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  titlebarButtonSvg: {
    width: 10,
    height: 10,
    shapeRendering: 'crispEdges',
  },
});

const WindowsTitlebar = ({ classes, isMaximized }) => (
  <div className={classes.titlebar}>
    <div className={classes.titlebarControls}>
      <div
        role="button"
        tabIndex="0"
        className={classes.titlebarButton}
        onClick={() => remote.getCurrentWindow().minimize()}
      >
        <svg className={classes.titlebarButtonSvg} x="0px" y="0px" viewBox="0 0 10 1">
          <rect fill="#fff" width="10" height="1" />
        </svg>
      </div>
      <div
        role="button"
        tabIndex="0"
        className={classes.titlebarButton}
        onClick={() => {
          if (remote.getCurrentWindow().isMaximized()) {
            remote.getCurrentWindow().unmaximize();
          } else {
            remote.getCurrentWindow().maximize();
          }
        }}
      >
        {!isMaximized ? (
          <svg className={classes.titlebarButtonSvg} x="0px" y="0px" viewBox="0 0 10 10">
            <path fill="#fff" d="M 0 0 L 0 10 L 10 10 L 10 0 L 0 0 z M 1 1 L 9 1 L 9 9 L 1 9 L 1 1 z " />
          </svg>
        ) : (
          <svg className={classes.titlebarButtonSvg} x="0px" y="0px" viewBox="0 0 10 10">
            <mask id="Mask">
              <rect fill="#fff" width="10" height="10" />
              <path fill="#000" d="M 3 1 L 9 1 L 9 7 L 8 7 L 8 2 L 3 2 L 3 1 z" />
              <path fill="#000" d="M 1 3 L 7 3 L 7 9 L 1 9 L 1 3 z" />
            </mask>
            <path fill="#fff" d="M 2 0 L 10 0 L 10 8 L 8 8 L 8 10 L 0 10 L 0 2 L 2 2 L 2 0 z" mask="url(#Mask)" />
          </svg>
        )}
      </div>
      <div
        role="button"
        tabIndex="0"
        className={classes.titlebarButton}
        onClick={() => remote.getCurrentWindow().close()}
      >
        <svg className={classes.titlebarButtonSvg} x="0px" y="0px" viewBox="0 0 10 10">
          <polygon fill="#fff" points="10,1 9,0 5,4 1,0 0,1 4,5 0,9 1,10 5,6 9,10 10,9 6,5" />
        </svg>
      </div>
    </div>
  </div>
);

WindowsTitlebar.propTypes = {
  classes: PropTypes.object.isRequired,
  isMaximized: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isMaximized: state.screen.isMaximized,
});

export default connectComponent(
  WindowsTitlebar,
  mapStateToProps,
  null,
  styles,
);
