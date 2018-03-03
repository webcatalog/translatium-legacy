import red from 'material-ui/colors/red';
import pink from 'material-ui/colors/pink';
import purple from 'material-ui/colors/purple';
import deepPurple from 'material-ui/colors/deepPurple';
import indigo from 'material-ui/colors/indigo';
import blue from 'material-ui/colors/blue';
import lightBlue from 'material-ui/colors/lightBlue';
import cyan from 'material-ui/colors/cyan';
import teal from 'material-ui/colors/teal';
import green from 'material-ui/colors/green';
import lightGreen from 'material-ui/colors/lightGreen';
import orange from 'material-ui/colors/orange';
import deepOrange from 'material-ui/colors/deepOrange';
import brown from 'material-ui/colors/brown';
import blueGrey from 'material-ui/colors/blueGrey';

export default {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green: {
    ...green,
    500: green[600],
  },
  lightGreen,
  orange,
  deepOrange,
  brown,
  blueGrey,
};
