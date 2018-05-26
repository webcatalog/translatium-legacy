import React from 'react';
import PropTypes from 'prop-types';

import Menu from '@material-ui/core/Menu';

import connectComponent from '../../helpers/connect-component';

const styles = {
  container: {
    display: 'inline',
  },
};

class EnhancedMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  render() {
    const {
      buttonElement,
      children,
      classes,
      id,
    } = this.props;

    return (
      <div className={classes.container}>
        {React.cloneElement(buttonElement, {
          'aria-owns': this.state.anchorEl ? id : null,
          'aria-haspopup': true,
          onClick: this.handleClick,
        })}
        <Menu
          id={id}
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
        >
          {React.Children.map(children, child => React.cloneElement(child, {
            onClick: () => {
              if (child.props.onClick) child.props.onClick();
              this.handleClose();
            },
          }))}
        </Menu>
      </div>
    );
  }
}

EnhancedMenu.propTypes = {
  buttonElement: PropTypes.element.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};

export default connectComponent(
  EnhancedMenu,
  null,
  null,
  styles,
);
