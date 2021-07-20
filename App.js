/**
 * @format
 * @flow strict-local
 */

import React, { Component } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";
import { _auth } from "./src/config";
import AuthScreen from "./src/main/app-auth/auth";
import SplashScreen from "./src/main/app-splash/splash";
import Home from "./src/main/app-home/home";
import * as Animatable from "react-native-animatable";
import {
  fadeOut,
  slideInRight,
  slideInUp,
  slideOutUp,
  slideInDown,
  slideOutDown,
} from "./src/assets/animations";
import ProgressBar from "react-native-progress/Circle";
import Dialog from "react-native-dialog";

export default class App extends Component {
  state = {
    authenticated: false,
    loaded: false,
    activeSplash: true,
    bypassAuth: false,
    loader: undefined,
    loaderMsg: "",
    loaderLabel: "",
    loaderOnClick: () => {},
    snackBar: false,
    snackBarMsg: "",
    dialog: {
      visible: false,
      title: "",
      desc: "",
      cancel: { text: "", func: undefined },
      confirm: { text: "", func: undefined },
    },
  };
  async componentDidMount() {
    await _auth.onAuthStateChanged(async (u) => {
      if (this.state.activeSplash === false && this.state.loaded === false) {
        this.setState({ activeSplash: true });
      }
      this.setState({ loaded: true, startApp: true });
      if (this.state.bypassAuth === false && u !== null) {
        this.setState({ authenticated: true });
      }
    });
  }

  async openDialog(title, desc, confirm, cancel) {
    if (!confirm) confirm = {};
    if (!cancel) cancel = {};
    if (!confirm.text) confirm.text = "confirm";
    if (!cancel.text) cancel.text = "Cancel";

    const dialog = { title, desc, confirm, cancel };
    dialog.visible = true;
    this.setState({ dialog });
  }
  async openTimedSnack(m, bottom) {
    this.setState({ snackBarMsg: m, snackBar: true, snackBarBottom: bottom });
    await setTimeout(() => {
      this.setState({ snackBar: false });
    }, 2500);
  }
  startLoader() {
    this.setState({ loader: true });
  }

  closeLoader() {
    this.setState({ loader: false });
  }
  render() {
    let snackAnim = this.state.snackBar ? slideInUp : slideOutUp;
    if (this.state.snackBarBottom)
      snackAnim = this.state.snackBar ? slideInDown : slideOutDown;
    const dg = this.state.dialog;
    return (
      <View style={{ backgroundColor: "#fff" }}>
        {this.state.activeSplash === true ? (
          <SplashScreen
            closeSplash={() => {
              if (this.state.loaded === true) {
                this.setState({ activeSplash: false, startApp: true });
              }
            }}
          />
        ) : this.state.authenticated === false ? (
          <AuthScreen
            init={() => {
              this.setState({ bypassAuth: true });
            }}
            authorizeUser={() => {
              this.setState({ authenticated: true });
            }}
            startLoader={this.startLoader.bind(this)}
            closeLoader={this.closeLoader.bind(this)}
            openTimedSnack={this.openTimedSnack.bind(this)}
          />
        ) : (
          <Home
            startLoader={this.startLoader.bind(this)}
            closeLoader={this.closeLoader.bind(this)}
            openTimedSnack={this.openTimedSnack.bind(this)}
            openDialog={this.openDialog.bind(this)}
          />
        )}
        {this.state.loader ? (
          <Loader
            visible={this.state.loader}
            action={{
              label: this.state.loaderLabel,
              onPress: this.state.loaderOnClick,
            }}
            onDismiss={() => {
              return true;
            }}
            msg={this.state.loaderMsg}
          />
        ) : (
          <View style={{ display: "none" }} />
        )}
        {this.state.snackBar ? (
          <Animatable.View
            animation={300}
            style={
              this.state.snackBarBottom ? style.snackBarBottom : style.snackBar
            }
            animation={snackAnim}
          >
            <Text style={style.snackBarMsg}>{this.state.snackBarMsg}</Text>
          </Animatable.View>
        ) : (
          <View style={{ display: "none" }} />
        )}
        <Dialog.Container visible={dg.visible}>
          <Dialog.Title>
            <Text
              style={{
                alignSelf: "center",
                flex: 1,
                fontFamily: "Raleway-Bold",
                fontSize: 25,
                color: "#000",
                borderLeftColor: "#ff011d",
              }}
            >
              {dg.title}
            </Text>
          </Dialog.Title>
          <Dialog.Description>
            <Text
              style={{
                alignSelf: "center",
                flex: 1,
                fontFamily: "Raleway-Regular",
                fontSize: 18,
                color: "#979998",
                borderLeftColor: "#ff011d",
              }}
            >
              {dg.desc}
            </Text>
          </Dialog.Description>
          <Dialog.Button
            label={dg.cancel.text}
            onPress={async () => {
              this.setState({ dialog: { ...dg, visible: false } });
              await setTimeout(() => {
                if (dg.cancel.func) dg.cancel.func();
              }, 1000);
            }}
            color={"#88898a"}
          />
          <Dialog.Button
            label={dg.confirm.text}
            onPress={async () => {
              this.setState({ dialog: { ...dg, visible: false } });
              await setTimeout(() => {
                if (dg.confirm.func) dg.confirm.func();
              }, 500);
            }}
            color={"#000000"}
            bold={true}
          />
        </Dialog.Container>
      </View>
    );
  }
}

const style = StyleSheet.create({
  snackBar: {
    position: "absolute",
    top: 15,
    right: 50,
    left: 50,
    borderRadius: 30,
    backgroundColor: "#454545",
  },
  snackBarBottom: {
    position: "absolute",
    bottom: 20,
    right: 50,
    left: 50,
    borderRadius: 30,
    backgroundColor: "#454545",
  },
  snackBarMsg: {
    padding: 10,
    flex: 1,
    textAlign: "center",
    color: "#e6ebf0",
  },
  loader: {
    position: "absolute",
    backgroundColor: "#00000011",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
  },
  snackContent: {
    width: 200,
    height: 200,
    alignSelf: "center",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  loaderMsg: {
    alignSelf: "center",
    fontSize: 18,
    fontFamily: "Raleway-Regular",
  },
});

class Loader extends Component {
  componentDidMount() {
    Keyboard.dismiss();
  }
  Content() {
    return (
      <View style={style.snackContent}>
        <ProgressBar size={80} indeterminate={true} color={"#fce16a"} />
      </View>
    );
  }
  render() {
    return (
      <Animatable.View
        duration={300}
        animation={this.props.visible === true ? slideInRight : fadeOut}
        style={style.loader}
      >
        {this.Content()}
      </Animatable.View>
    );
  }
}
