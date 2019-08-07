// External Dependencies
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

const connectComponent = (component, mapStateToProps, mapDispatchToProps, styles) => {
  const styledComponent = styles
    ? withStyles(styles)(component, { name: component.name })
    : component;

  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(styledComponent);
};

export default connectComponent;
