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
import { slideInRight, slideInLeft } from "../../../../assets/animations/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { _storage, _database, _auth, TimeStamp } from "../../../../config";
import { encryptText } from "../../../../encryption/index";
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

export default class CreateMessage extends React.Component {
  state = {
    title: "",
    content: "",
    password: "",
  };

  async saveDraft() {
    try {
      const { title, content } = this.state;
      const jsonValue = JSON.stringify({
        title,
        content,
      });
      await AsyncStorage.setItem("@Msg_Draft", jsonValue);
    } catch (e) {
      this.props.openTimedSnack("Caching Error", true);
    }
  }

  async getData() {
    try {
      const jsonValue = await AsyncStorage.getItem("@Msg_Draft");
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      this.props.openTimedSnack("Caching Error", true);
    }
  }
  async clearCache() {
    try {
      await AsyncStorage.setItem("@Msg_Draft", "");
    } catch (e) {
      this.props.openTimedSnack("Caching Error", true);
    }
    return true;
  }
  async componentDidMount() {
    this.props.enableChill();
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      {
        if (this.state.block) {
          this.props.openTimedSnack("Please Hold", true);
        } else if (this.state.encryptMessage) {
          this.setState({ encryptMessage: undefined });
        } else if (this.state.content || this.state.title)
          this.props.openDialog(
            "Hold On",
            "Do you want to save a draft copy of this Content?",
            {
              text: "YES",
              func: () => {
                this.saveDraft().then(() => {
                  this.props.openTimedSnack(
                    "Draft Saved",
                    this.props.authenticated
                  );
                  this.props.goHome();
                });
              },
            },
            {
              text: "No",
              func: () =>
                this.clearCache().then(() => {
                  this.props.goHome();
                }),
            }
          );
        else this.props.goHome();

        return true;
      }
    });
    await this.getData().then(async (jsonValue) => {
      if (jsonValue) {
        this.setState({ ...jsonValue });
      }
    });
  }
  componentWillUnmount() {
    this.props.disableChill();
    this.props.disableChill();
    this.backHandler.remove();
  }
  async encryptUpload() {
    this.props.startLoader();
    this.setState({ block: true });
    const message = encryptText(this.state.content, this.state.password);
    var fileUri =
      FileSystem.documentDirectory +
      "/" +
      this.state.title +
      new Date().getTime() +
      ".menc";
    await FileSystem.writeAsStringAsync(fileUri, message, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const response = await fetch(fileUri);
    const _file = await response.blob();
    const uploadTask = _storage
      .ref(
        "/encryption/messages/" +
          _auth.currentUser.uid +
          "/" +
          this.state.title +
          ".menc"
      )
      .put(_file);
    const ref = _database
      .ref("users/" + _auth.currentUser.uid + "/encryption/messages")
      .push();
    let url;
    uploadTask
      .on(
        "state_changed",
        function () {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then(
              function (downloadURL) {
                url = "" + downloadURL;
              }.bind(this)
            )
            .catch(async (e) => {
              console.log(e);
            })
            .finally(() => {
              if (url) {
                ref.set({
                  title: this.state.title,
                  url,
                  uploaded: TimeStamp,
                });
                this.clearCache().finally(() => {
                  this.props.closeLoader();
                  this.props.openTimedSnack(
                    "Encryption Succesfull: File Uploaded",
                    true
                  );
                  this.props.goHome();
                });
              } else {
                this.props.closeLoader();
                this.props.openTimedSnack("Encryption Failed", true);
              }
            });
        }.bind(this)
      )
      .bind(this);
  }
  render() {
    return (
      <Animatable.View
        animation={slideInRight}
        style={style.mainContent}
        duration={300}
      >
        <View style={style.titleBar}>
          <Text style={style.titleText}>
            {this.state.encryptMessage ? "Encrypt" : "Create"}
          </Text>
          <TouchableOpacity
            onPress={async () => {
              await setTimeout(async () => {
                if (this.state.encryptMessage) {
                  if (this.state.password && this.state.password.length >= 8) {
                    await this.encryptUpload();
                  } else {
                    this.props.openTimedSnack(
                      "8 Char long password Required",
                      true
                    );
                  }
                } else if (this.state.title && this.state.content) {
                  this.saveDraft().then((x) => {
                    this.setState({ encryptMessage: true, loaded: true });
                  });
                } else {
                  this.props.openTimedSnack("Fields Required!", true);
                }
              }, 200);
            }}
          >
            <Image
              style={style.titleBtn}
              source={require("../../../../assets/drawable/ic-send.png")}
            />
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
        {this.state.encryptMessage ? (
          <EncryptMessage
            update={(x) => {
              this.setState({ ...x });
            }}
            password={this.state.password}
          />
        ) : (
          <Animatable.View
            duration={300}
            animation={this.state.loaded ? slideInLeft : undefined}
            style={{ flex: 1 }}
          >
            <View style={style.field}>
              <Text style={style.fieldTitle}>Title</Text>
              <TextInput
                value={this.state.title}
                placeholderTextColor="#929292"
                onChangeText={(e) => {
                  this.setState({ title: e });
                }}
                style={style.fieldInput}
                placeholder="Title"
              />
            </View>
            <View style={style.Content}>
              <Text style={style.fieldTitle}>Content</Text>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholderTextColor="#929292"
                  onChangeText={(e) => {
                    this.setState({ content: e });
                  }}
                  multiline
                  placeholder="Content"
                  style={style.ContentInput}
                  value={this.state.content}
                />
              </View>
            </View>
          </Animatable.View>
        )}
      </Animatable.View>
    );
  }
}
class EncryptMessage extends React.Component {
  render() {
    return (
      <Animatable.View
        animation={slideInRight}
        style={{ flex: 1 }}
        duration={300}
      >
        <View style={{ height: 30 }} />
        <View style={style.field}>
          <Text style={style.fieldTitle}>Your Encrytpion Password</Text>
          <TextInput
            value={this.props.password}
            placeholderTextColor="#929292"
            onChangeText={(e) => {
              this.props.update({ password: e });
            }}
            style={style.fieldInput}
            placeholder="File Password"
          />
        </View>
      </Animatable.View>
    );
  }
}
