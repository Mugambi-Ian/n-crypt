import React, {Component} from 'react';
import {StyleSheet, StatusBar, Text, View, AppState} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {fadeIn} from '../../assets/animations/index';
import Activate from './activate';
import Dashboard from './dashboard/dashboard';
const style = StyleSheet.create({
  mainContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  loading: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loadingText: {
    textAlign: 'center',
    margin: 15,
  },
  mask: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
});

export default class Home extends Component {
  state = {
    adminData: {
      pin: '',
    },
    appState: AppState.currentState,
  };

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.setState({authenticated: false});
    }
    this.setState({appState: nextAppState});
  };
  x = (<View style={{display: 'none'}} />);
  render() {
    return (
      <Animatable.View
        style={style.mainContent}
        animation={fadeIn}
        duration={300}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Animatable.View animation={fadeIn} duration={300}>
          {this.state.authenticated || this.state.chill ? (
            <Dashboard
              openDialog={this.props.openDialog}
              authenticated={this.state.authenticated}
              userState={x => {
                this.setState({userState: x});
              }}
              startLoader={this.props.startLoader}
              closeLoader={this.props.closeLoader}
              enableChill={() => {
                this.setState({chill: true});
              }}
              disableChill={() => {
                this.setState({chill: undefined});
              }}
              removePin={() => {
                this.setState({authenticated: false, removePin: true});
              }}
              openTimedSnack={this.props.openTimedSnack}
            />
          ) : (
            <Activate
              admin={this.state.adminData}
              startLoader={this.props.startLoader}
              closeLoader={this.props.closeLoader}
              openTimedSnack={this.props.openTimedSnack}
              authenticate={() => {
                this.setState({authenticated: true, removePin: false});
              }}
              removePin={this.state.removePin}
            />
          )}
        </Animatable.View>
      </Animatable.View>
    );
  }
}
