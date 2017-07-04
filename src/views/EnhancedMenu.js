import React from 'react';
import PropTypes from 'prop-types';

import Menu from 'material-ui/Menu';

class EnhancedMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: undefined,
      open: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleClick(event) {
    this.setState({ open: true, anchorEl: event.currentTarget });
  }

  handleRequestClose() {
    this.setState({ open: false });
  }

  render() {
    const {
      buttonElement,
      children,
      id,
    } = this.props;

    return (
      <div>
        {React.cloneElement(buttonElement, {
          'aria-owns': id,
          'aria-haspopup': true,
          onClick: this.handleClick,
        })}
        <Menu
          id={id}
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
        >
          {React.Children.map(children, child => React.cloneElement(child, {
            onClick: () => {
              if (child.props.onClick) child.props.onClick();
              this.handleRequestClose();
            },
          }))}
        </Menu>
      </div>
    );
  }
}

EnhancedMenu.propTypes = {
  buttonElement: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired,
  id: PropTypes.string.isRequired,
};

export default EnhancedMenu;
