import React from 'react';
import { connect } from 'react-redux';

import { fullWhite, minBlack, grey100 } from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';

import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ContentClear from 'material-ui/svg-icons/content/clear';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import ImageCameraAlt from 'material-ui/svg-icons/image/camera-alt';
import ContentGesture from 'material-ui/svg-icons/content/gesture';
import AVVolumeUp from 'material-ui/svg-icons/av/volume-up';
import AVMic from 'material-ui/svg-icons/av/mic';

class Home extends React.Component {
  getStyles() {
    const {
      appBar,
      button: {
        iconButtonSize,
      },
    } = this.context.muiTheme;

    return {
      container: {
        flex: 1,
        backgroundColor: grey100,
        display: 'flex',
        flexDirection: 'column',
      },
      innerContainer: {
        flex: 1,
        display: 'flex',
      },
      languageTitle: {
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        margin: 0,
        paddingTop: 0,
        letterSpacing: 0,
        fontSize: 20,
        fontWeight: appBar.titleFontWeight,
        color: appBar.textColor,
        height: appBar.height,
        lineHeight: `${appBar.height}px`,
        display: 'flex',
        justifyContent: 'center',
        WebkitUserSelect: 'none',
        cursor: 'pointer',
      },
      languageTitleSpan: {
        float: 'left',
      },
      dropDownIconContainer: {
        height: appBar.height,
        paddingTop: (appBar.height - iconButtonSize) / 2,
        float: 'left',
      },
      swapIconContainer: {
        paddingTop: (appBar.height - iconButtonSize) / 2,
      },
      inputContainer: {
        height: 160,
        display: 'flex',
        flexDirection: 'column',
      },
      textarea: {
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        borderBottom: `1px solid ${minBlack}`,
        outline: 0,
        padding: 12,
        fontSize: 16,
        boxSizing: 'border-box',
        flex: 1,
      },
      controllerContainer: {
        flexBasis: 48,
        paddingLeft: 8,
        paddingRight: 8,
        boxSizing: 'border-box',
      },
      controllerContainerLeft: {
        float: 'left',
      },
      controllerContainerRight: {
        float: 'right',
        paddingTop: 6,
      },
      resultContainer: {
        flex: 1,
        padding: '24px 12px',
        boxSizing: 'border-box',
        height: '100%',
        overflowY: 'auto',
      },
    };
  }

  render() {
    const { screenWidth } = this.props;
    const styles = this.getStyles();

    const controllers = [
      {
        icon: <ContentClear />,
        tooltip: 'Clear',
      },
      {
        icon: <AVVolumeUp />,
        tooltip: 'Listen',
      },
      {
        icon: <AVMic />,
        tooltip: 'Speak',
      },
      {
        icon: <ContentGesture />,
        tooltip: 'Draw',
      },
      {
        icon: <ImageCameraAlt />,
        tooltip: 'Camera',
      },
    ];

    const maxVisibleIcon = Math.min(Math.round((screenWidth - 200) / 56), controllers.length);
    const showMoreButton = (maxVisibleIcon < controllers.length);

    return (
      <div style={styles.container}>
        <AppBar
          showMenuIconButton={false}
          title={(
            <div style={styles.innerContainer}>
              <div style={styles.languageTitle}>
                <span style={styles.languageTitleSpan}>English</span>
                <div style={styles.dropDownIconContainer}>
                  <NavigationArrowDropDown color={fullWhite} />
                </div>
              </div>
              <div style={styles.swapIconContainer}>
                <IconButton>
                  <ActionSwapHoriz color={fullWhite} />
                </IconButton>
              </div>
              <div style={styles.languageTitle}>
                <span style={styles.languageTitleSpan}>English</span>
                <div style={styles.dropDownIconContainer}>
                  <NavigationArrowDropDown color={fullWhite} />
                </div>
              </div>
            </div>
          )}
        />
        <Paper zDepth={1} style={styles.inputContainer}>
          <textarea style={styles.textarea} placeholder="Type something here..." />
          <div style={styles.controllerContainer}>
            <div style={styles.controllerContainerLeft}>
              {controllers.slice(0, maxVisibleIcon).map(({ icon, tooltip }, i) => (
                <IconButton tooltip={tooltip} tooltipPosition="bottom-center" key={`cIconButton_${i}`}>
                  {icon}
                </IconButton>
              ))}
              {(showMoreButton) ? (
                <IconMenu
                  iconButtonElement={(
                    <IconButton tooltip="More" tooltipPosition="bottom-center">
                      <NavigationMoreVert />
                    </IconButton>
                  )}
                  anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                  targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                >
                  {
                    controllers
                      .slice(maxVisibleIcon, controllers.length)
                      .map(({ icon, tooltip }, i) => (
                        <MenuItem primaryText={tooltip} leftIcon={icon} key={`cMenuItem_${i}`} />
                      ))
                  }
                </IconMenu>
              ) : null}
            </div>
            <div style={styles.controllerContainerRight}>
              <RaisedButton label="Translate" primary />
            </div>
          </div>
        </Paper>
        <div style={styles.resultContainer}>
          <Card initiallyExpanded>
            <CardHeader
              title="Vietnamese"
              subtitle="from English"
              actAsExpander
              showExpandableButton
            />
            <CardText>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
              Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
              Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
            </CardText>
            <CardActions>
              <FlatButton label="Action1" />
              <FlatButton label="Action2" />
            </CardActions>
            <CardText expandable>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
              Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
              Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.

              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
              Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
              Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.

              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
              Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
              Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
            </CardText>
          </Card>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  screenWidth: React.PropTypes.number,
};

const mapStateToProps = state => ({
  screenWidth: state.screen.screenWidth,
});

Home.contextTypes = {
  muiTheme: React.PropTypes.object,
};

export default connect(
  mapStateToProps
)(Home);
