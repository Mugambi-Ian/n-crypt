import React from 'react';
import {StyleSheet, Image, TouchableOpacity, Text, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {fadeIn} from '../../assets/animations/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {decryptText, encryptText, PRIVATE_KEY} from '../../encryption';

const style = StyleSheet.create({
  mainContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: 20,
    resizeMode: 'contain',
    height: 150,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 20,
    marginBottom: 30,
    color: '#00000099',
    alignSelf: 'center',
    textAlign: 'center',
  },
  numpad: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  numpadBtn: {
    margin: 5,
    color: '#fff',
    padding: 30,
    paddingLeft: 40,
    paddingRight: 40,
    alignSelf: 'center',
    textAlign: 'center',
    backgroundColor: '#57585a',
    color: '#fff',
    fontSize: 20,
    borderRadius: 50,
  },
  empty: {
    width: 45,
    height: 45,
    margin: 5,
  },
  full: {
    width: 45,
    height: 45,
    margin: 5,
  },
});

export default class Activate extends React.Component {
  state = {
    pin: '',
    authCode: '',
    admin: {pin: undefined},
  };
  async readAdmin() {
    try {
      let jsonValue = await AsyncStorage.getItem('@Admin_Data');
      if (jsonValue !== null) {
        jsonValue = JSON.parse(jsonValue.toString());
      } else jsonValue = {};
      this.setState({admin: jsonValue, loader1: false});
    } catch (e) {
      console.log(e);
      this.props.openTimedSnack('Caching Error', true);
    }
  }

  async writeAdmin(data) {
    try {
      let jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem('@Admin_Data', jsonValue);
      await this.props.readAdmin();
    } catch (e) {
      this.props.openTimedSnack('Caching Error', true);
    }
    return true;
  }
  async componentDidMount() {
    await this.readAdmin();
    const admin = this.state.admin;
    if (admin.pin && !this.props.removePin) {
      console.log(admin.pin);
      const code = decryptText(admin.pin, PRIVATE_KEY);
      console.log(code);
      this.setState({
        authCode: code,
        currentTitle: 'Enter Your Access Pin',
        func: x => {
          if (x === code) {
            this.props.authenticate();
          } else {
            this.props.openTimedSnack('Failed');
            this.setState({pin: ''});
          }
        },
      });
    } else {
      const func = async x => {
        if (this.state.setPin) {
          if (this.state.setPin === x) {
            console.log(x);
            const pin = encryptText(x, PRIVATE_KEY);
            console.log(pin);
            await this.writeAdmin({pin})
              .then(() => {
                this.props.openTimedSnack('Pin Saved', true);
                this.props.authenticate();
              })
              .catch(() => {
                this.props.closeLoader();
                this.props.openTimedSnack('Error Saving Pin');
                this.setState({
                  currentTitle: 'Create A 5 Digit Access Pin',
                  setPin: '',
                  pin: '',
                });
              });
          } else {
            this.props.openTimedSnack('Mismatch Try Again');
            this.setState({
              currentTitle: 'Create A 5 Digit Access Pin',
              setPin: '',
              pin: '',
            });
          }
        } else
          this.setState({
            setPin: x,
            pin: '',
            currentTitle: 'Confirm Your Access Pin',
          });
      };
      this.setState({
        currentTitle: 'Create A 5 Digit Access Pin',
        func: func,
      });
    }
  }
  async pinInput(x) {
    let pin = this.state.pin;
    if (x === 'CLR') pin = '';
    else if (x === 'BSC') pin = pin.slice(0, pin.length - 1);
    else pin = pin + x;
    if (pin.length <= 5) {
      this.setState({pin});
    }
    if (pin.length >= 5) {
      await setTimeout(async () => {
        this.state.func(pin);
      }, 1000);
    }
  }
  Full() {
    return (
      <Animatable.Image
        source={require('../../assets/drawable/ic-full.png')}
        animation={fadeIn}
        style={style.full}
      />
    );
  }
  Empty() {
    return (
      <Animatable.Image
        source={require('../../assets/drawable/ic-empty.png')}
        animation={fadeIn}
        style={style.empty}
      />
    );
  }
  render() {
    const pin = this.state.pin;
    return (
      <Animatable.View
        style={style.mainContent}
        animation={fadeIn}
        duration={400}>
        <Image
          source={require('../../assets/drawable/icon.png')}
          style={style.logo}
        />
        <Text style={style.title}>{this.state.currentTitle}</Text>
        <View style={style.row}>
          {pin.length >= 1 ? this.Full() : this.Empty()}
          {pin.length >= 2 ? this.Full() : this.Empty()}
          {pin.length >= 3 ? this.Full() : this.Empty()}
          {pin.length >= 4 ? this.Full() : this.Empty()}
          {pin.length >= 5 ? this.Full() : this.Empty()}
        </View>
        <View style={style.numpad}>
          <View style={style.row}>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('1');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('2');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('3');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>3</Text>
            </TouchableOpacity>
          </View>
          <View style={style.row}>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('4');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('5');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('6');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>6</Text>
            </TouchableOpacity>
          </View>
          <View style={style.row}>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('7');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>7</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('8');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>8</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('9');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>9</Text>
            </TouchableOpacity>
          </View>
          <View style={style.row}>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('CLR');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>CLR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('0');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await setTimeout(async () => {
                  await this.pinInput('BSC');
                }, 200);
              }}>
              <Text style={style.numpadBtn}>BSC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    );
  }
}
