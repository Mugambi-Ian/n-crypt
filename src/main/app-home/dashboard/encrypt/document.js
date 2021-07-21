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
import { slideInRight } from "../../../../assets/animations/index";
import * as FileSystem from "expo-file-system";
import { _storage, _database, _auth, TimeStamp } from "../../../../config";
import { encryptText } from "../../../../encryption/index";
import DocumentPicker from "react-native-document-picker";
import esrever from "esrever";
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

export default class EncryptDocument extends React.Component {
  state = {
    title: "",
    content: "",
    password: "",
  };

  async componentDidMount() {
    this.props.enableChill();
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
        type: [DocumentPicker.types.plainText, DocumentPicker.types.csv],
      });
      this.props.startLoader();
      let response = await fetch(res.uri);
      let result = await response.blob();
      let reader = new FileReader();
      reader.readAsText(result);
      reader.addEventListener("loadend", () => {
        console.log(reader.result);
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
    } catch (err) {
      this.props.closeLoader();
      this.props.goHome();
      this.props.openTimedSnack("Failed to fetch file.");
      console.log(err);
    }
  }
  componentWillUnmount() {
    this.props.disableChill();
    this.backHandler.remove();
  }
  async encryptUpload() {
    await this.props.startLoader();
    await setTimeout(async () => {
      const message = encryptText(this.state.content, this.state.password);
      console.log("encrypt");
      this.setState({ block: true });
      var fileUri =
        FileSystem.documentDirectory +
        "/" +
        this.state.title +
        new Date().getTime() +
        ".penc";
      await FileSystem.writeAsStringAsync(fileUri, message, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const response = await fetch(fileUri);
      const _file = await response.blob();
      const uploadTask = _storage
        .ref(
          "/encryption/documents/" +
            _auth.currentUser.uid +
            "/" +
            this.state.title +
            ".penc"
        )
        .put(_file);
      const ref = _database
        .ref("users/" + _auth.currentUser.uid + "/encryption/documents/")
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
                  this.props.closeLoader();
                  this.props.openTimedSnack(
                    "Encryption Succesfull: File Uploaded",
                    true
                  );
                  this.props.goHome();
                } else {
                  this.props.closeLoader();
                  this.props.openTimedSnack("Encryption Failed", true);
                }
              });
          }.bind(this)
        )
        .bind(this);
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
          <Text style={style.titleText}>Encrypt</Text>
          <TouchableOpacity
            onPress={async () => {
              await setTimeout(async () => {
                if (this.state.password && this.state.password.length >= 8) {
                  await this.encryptUpload();
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
              source={require("../../../../assets/drawable/ic-full.png")}
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
