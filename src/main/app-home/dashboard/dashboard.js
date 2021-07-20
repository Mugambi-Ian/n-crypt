import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {slideInRight, slideInLeft} from '../../../assets/animations/index';
import CreateMessage from './encrypt/message';

const style = StyleSheet.create({
  mainContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  titleBar: {
    top: 10,
    marginLeft: 20,
    height: 40,
    flexDirection: 'row',
  },
  titleText: {
    alignSelf: 'center',
    flex: 1,
    fontFamily: 'Raleway-Bold',
    fontSize: 27,
    color: '#000',
    borderLeftColor: '#ff011d',
    borderLeftWidth: 5,
    paddingLeft: 15,
  },
  titleBtn: {
    width: 45,
    height: 45,
    marginRight: 20,
  },
  dashView: {
    marginTop: 20,
  },
  dashCard: {
    backgroundColor: '#fff',
    marginRight: 20,
    marginLeft: 20,
    height: 210,
    elevation: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  dashContent: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
  },
  dashCardLast: {
    backgroundColor: '#fff',
    marginRight: 20,
    marginLeft: 20,
    height: 210,
    elevation: 10,
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 10,
  },
  dashContent: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,

    borderBottomColor: '#f3f3f3',
    borderBottomWidth: 2,
  },
  dashIcon: {
    alignSelf: 'center',
    height: 80,
    width: 80,
    marginRight: 10,
  },
  dashDetails: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
    borderLeftColor: '#f3f3f3',
    borderLeftWidth: 2,
    padding: 5,
    paddingTop: 0,
    paddingLeft: 10,
    paddingRight: 20,
  },
  dashTitle: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 22,
    color: '#000',
    marginLeft: 5,
  },
  dashDescription: {
    fontFamily: 'Raleway-Regular',
    fontSize: 18,
    color: '#57585a',
    marginLeft: 5,
  },
  dashBtn: {
    backgroundColor: '#f3f3f3',
    padding: 14,
    paddingTop: 7,
    color: '#57585a',
    fontFamily: 'Raleway-Bold',
    fontSize: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    textAlign: 'center',
  },
});

export default class Dashboard extends React.Component {
  state = this.props.state
    ? this.props.state
    : {
        currentScreen: 'home',
        title: 'Dashboard',
      };
  goHome() {
    this.setState({currentScreen: 'home', title: 'Dashboard', back: true});
  }
  Card(x) {
    return (
      <View style={x.last ? style.dashCardLast : style.dashCard}>
        <View style={style.dashContent}>
          <Image source={x.icon} style={style.dashIcon} />
          <View style={style.dashDetails}>
            <Text style={style.dashTitle}>{x.title}</Text>
            <Text style={style.dashDescription}>{x.description}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={async () => {
            await setTimeout(() => {
              x.func();
            }, 200);
          }}>
          <Text style={style.dashBtn}>{x.text}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  render() {
    return this.state.currentScreen === 'home' ? (
      <Animatable.View
        animation={this.state.back ? slideInLeft : slideInRight}
        style={style.mainContent}
        duration={300}>
        <View style={style.titleBar}>
          <Text style={style.titleText}>{this.state.title}</Text>
          <TouchableOpacity
            onPress={async () => {
              await setTimeout(() => {
                this.props.openDialog(
                  'Change Access Pin',
                  'By clicking confirm you will reset your access pin. Are you sure of this?',
                  {
                    func: () => {
                      this.props.removePin();
                      this.props.openTimedSnack('Reset Pin');
                    },
                  },
                );
              }, 200);
            }}>
            <Image
              style={style.titleBtn}
              source={require('../../../assets/drawable/ic-full.png')}
            />
          </TouchableOpacity>
        </View>
        <ScrollView style={style.dashView}>
          {this.Card({
            title: 'Encrypt A  Message',
            description: 'Create an encrypted text file from scratch.',
            icon: require('../../../assets/drawable/ic-text.png'),
            func: () => {
              this.setState({currentScreen: 'msg'});
            },
            text: 'Encrypt',
          })}
          {this.Card({
            title: 'Encrypt A Document',
            description: 'Create an encrpted file of an existing Document.',
            icon: require('../../../assets/drawable/ic-doc.png'),
            func: () => {},
            text: 'Encrypt',
          })}
          {this.Card({
            title: 'Decrypt A File',
            description: 'Decrypt an encrypted file.',
            icon: require('../../../assets/drawable/ic-decrypt.png'),
            func: () => {},
            text: 'Decrypt',
          })}
          {this.Card({
            title: 'Edit Message',
            description: 'Edit the contet of an existing encrypted      file.',
            icon: require('../../../assets/drawable/ic-write.png'),
            func: () => {},
            last: true,
            text: 'Edit',
          })}
        </ScrollView>
      </Animatable.View>
    ) : this.state.currentScreen === 'msg' ? (
      <CreateMessage
        enableChill={this.props.enableChill}
        disableChill={this.props.disableChill}
        goHome={this.goHome.bind(this)}
        openTimedSnack={this.props.openTimedSnack}
        startLoader={this.props.startLoader}
        closeLoader={this.props.closeLoader}
        authenticated={this.props.authenticated}
        openDialog={this.props.openDialog}
      />
    ) : (
      <View />
    );
  }
}
