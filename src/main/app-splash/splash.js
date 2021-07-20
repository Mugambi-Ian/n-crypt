import React, {Component} from 'react';
import {StatusBar, StyleSheet, Text} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {fadeIn, slideOutLeft} from '../../assets/animations';

const style = StyleSheet.create({
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    height: 350,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -100,
  },
  title: {
    bottom: 30,
    left: 0,
    right: 0,
    position: 'absolute',
    fontFamily: 'Raleway-SemiBold',
    fontSize: 18,
    color: '#00000099',
    textAlign: 'center',
  },
});

export default class SplashScreen extends Component {
  state = {
    close: false,
  };
  async componentDidMount() {
    await setTimeout(async () => {
      this.setState({out: true});
      await setTimeout(async () => {
        this.setState({close: undefined});
        await setTimeout(() => {
          this.props.closeSplash();
        }, 500);
      }, 1000);
    }, 3000);
  }
  render() {
    return (
      <Animatable.View
        delay={this.state.out ? 400 : 0}
        animation={this.state.close === false ? fadeIn : slideOutLeft}
        style={style.mainContent}>
        <StatusBar barStyle="light-content" backgroundColor="#fff" />
        <Animatable.View style={style.mainContent}>
          <Animatable.Image
            style={style.logo}
            source={require('../../assets/drawable/icon.png')}
          />
          <Text style={style.title}>• Encrypt • Decrypt • Repeat •</Text>
        </Animatable.View>
      </Animatable.View>
    );
  }
}
