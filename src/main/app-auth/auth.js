import React, { Component } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  slideInDown,
  slideInRight,
  slideOutLeft,
} from "../../assets/animations";
import { _auth, _database, GoogleAuthProvider, CLIENT_ID } from "../../config";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: CLIENT_ID,
});
const style = StyleSheet.create({
  mainContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fce16a",
  },
  logoBox: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    resizeMode: "contain",
    height: 120,
    alignSelf: "center",
  },
  loginBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderColor: "#e9e9e9",
    borderWidth: 1,
  },
  title: {
    fontFamily: "Raleway-SemiBold",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    fontSize: 20,
    color: "#000",
  },
  subTitle: {
    fontFamily: "Raleway-Light",
    marginLeft: 20,
    marginTop: 5,
    marginRight: 20,
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
  },
  btn: {
    marginRight: 20,
    marginLeft: 20,
    flexDirection: "row",
    borderRadius: 10,
    elevation: 5,
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
  btnIcon: {
    height: 35,
    width: 35,
    marginRight: 5,
  },
  btnText: {
    marginLeft: 5,
    alignSelf: "center",
    fontFamily: "Raleway-Regular",
    marginLeft: 10,
    marginRight: 10,
    fontSize: 20,
    color: "#111111",
  },
});

export default class AuthScreen extends Component {
  state = {
    close: false,
    phoneNumber: "",
    confirmCode: undefined,
    verificationCode: "",
  };
  componentDidMount() {
    this.props.init();
  }
  render() {
    return (
      <Animatable.View
        animation={this.state.close === false ? slideInRight : slideOutLeft}
        style={style.mainContent}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fce16a" />
        <View style={style.logoBox}>
          <Image
            source={require("../../assets/drawable/icon.png")}
            style={style.logo}
          />
        </View>
        <Animatable.View
          delay={500}
          style={style.loginBox}
          animation={slideInDown}
        >
          <Text style={style.title}>Sign In</Text>
          <Text style={style.subTitle}>
            Select your preffered google account to sign in
          </Text>
          <TouchableOpacity
            style={style.btn}
            onPress={async () => {
              this.props.startLoader();
              await setTimeout(async () => {
                try {
                  await GoogleSignin.signOut();
                  const { idToken } = await GoogleSignin.signIn();
                  const googleCredential =
                    GoogleAuthProvider.credential(idToken);
                  await _auth.signInWithCredential(googleCredential);
                  this.props.openTimedSnack("Verification Succesfull", true);
                  this.setState({ close: true });
                  await setTimeout(() => {
                    this.props.authorizeUser();
                  }, 500);
                } catch (e) {
                  this.props.openTimedSnack("Verification Failed", true);
                  console.log(e);
                }
                this.props.closeLoader();
              }, 1000);
            }}
          >
            <Image
              source={require("../../assets/drawable/ic-google.png")}
              style={style.btnIcon}
            />
            <Text style={style.btnText}>Google</Text>
          </TouchableOpacity>
        </Animatable.View>
      </Animatable.View>
    );
  }
}
