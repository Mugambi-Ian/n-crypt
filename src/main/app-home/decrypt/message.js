import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  BackHandler,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { slideInRight } from "../../../assets/animations/index";
import * as FileSystem from "expo-file-system";
import { _storage, _database, _auth, TimeStamp } from "../../../config";
import { decryptText } from "../../../encryption/index";
import DocumentPicker from "react-native-document-picker";

const style = StyleSheet.create({
  mainContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  titleBar: {
    top: 10,
    marginLeft: 20,
    height: 40,
    flexDirection: "row",
  },
  titleText: {
    alignSelf: "center",
    flex: 1,
    fontFamily: "Raleway-Bold",
    fontSize: 27,
    color: "#000",
    borderLeftColor: "#ff011d",
    borderLeftWidth: 5,
    paddingLeft: 15,
  },
  titleBtn: {
    width: 45,
    height: 45,
    marginRight: 20,
  },
  field: {
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 4,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },
  fieldTitle: {
    fontSize: 16,
    color: "#929292",
    marginLeft: 10,
    marginTop: 5,
    fontFamily: "Raleway-Regular",
    marginBottom: 5,
  },
  fieldInput: {
    marginBottom: 5,
    padding: 0,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 18,
    color: "#000",
  },
  Content: {
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 4,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    flex: 1,
  },
  ContentInput: {
    padding: 0,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 18,
    color: "#000",
  },
});

export default class DecryptMessage extends React.Component {
  state = {
    title: "",
    content: "",
    password: "",
  };

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      {
        if (this.state.block) {
          this.props.openTimedSnack("Please Hold", true);
        } else this.props.goHome();
        return true;
      }
    });
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (res.name.includes(".menc")) {
        this.props.startLoader();
        let response = await fetch(res.uri);
        let result = await response.blob();
        let reader = new FileReader();
        reader.readAsText(result);
        reader.addEventListener("loadend", () => {
          let name = res.name;
          const content = JSON.stringify({
            type: res.type,
            content: reader.result,
            name,
          });
          let title = name.replace("/ /g", "_").replace("/./g", "");
          title = title.replace(".", "_");
          this.setState({ content, title });
          this.props.closeLoader();
        });
      } else {
        this.props.goHome();
        this.props.openTimedSnack("Failed to fetch file.", true);
      }
    } catch (err) {
      this.props.closeLoader();
      this.props.goHome();
      this.props.openTimedSnack("Failed to fetch file.", true);
      console.log(err);
    }
  }
  componentWillUnmount() {
    this.backHandler.remove();
  }
  async decryptUpload() {
    await this.props.startLoader();
    this.setState({ block: true });
    await setTimeout(async () => {
      try {
        let message = decryptText(this.state.content, this.state.password);
        message = message.split("##Start##")[1];
        message = message.split("##End##")[0];
        if (message.includes("content:") && message.includes("title:")) {
          message = message.split("<####>");
          const title = message[1].replace("title:", "");
          const content = message[0].replace("content:", "");
          const key = message[2].replace("key:", "");
          if (key === this.state.password) {
            const ref = _database
              .ref("users/" + _auth.currentUser.uid + "/decryption")
              .push();
            ref.set({
              title: title,
              url: content,
              uploaded: TimeStamp,
              type: "Message",
            });
            this.props.closeLoader();
            this.props.openTimedSnack(
              "Decryption Succesfull: Message Saved",
              true
            );
            this.props.goHome();
          } else {
            this.setState({ block: false });
            this.props.closeLoader();
            this.props.openTimedSnack("Decryption Failed", true);
          }
        } else {
          this.setState({ block: false });
          this.props.closeLoader();
          this.props.openTimedSnack("Decryption Failed", true);
        }
      } catch (er) {
        this.setState({ block: false });
        this.props.closeLoader();
        this.props.openTimedSnack("Decryption Failed", true);
      }
    }, 500);
  }
  render() {
    return (
      <Animatable.View
        animation={slideInRight}
        style={style.mainContent}
        duration={300}
      >
        <View style={style.titleBar}>
          <Text style={style.titleText}>Decrypt</Text>
          <TouchableOpacity
            onPress={async () => {
              await setTimeout(async () => {
                if (this.state.password && this.state.password.length >= 8) {
                  await this.decryptUpload();
                } else {
                  this.props.openTimedSnack(
                    "8 Char long password Required",
                    true
                  );
                }
              }, 200);
            }}
          >
            <Image
              style={style.titleBtn}
              source={require("../../../assets/drawable/ic-unlock.png")}
            />
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
        <Animatable.View
          animation={slideInRight}
          style={{ flex: 1 }}
          duration={300}
        >
          <View style={{ height: 30 }} />
          <View style={style.field}>
            <Text style={style.fieldTitle}>Your Encrytpion Password</Text>
            <TextInput
              value={this.state.password}
              placeholderTextColor="#929292"
              onChangeText={(e) => {
                this.setState({ password: e });
              }}
              style={style.fieldInput}
              placeholder="File Password"
            />
          </View>
        </Animatable.View>
      </Animatable.View>
    );
  }
}
