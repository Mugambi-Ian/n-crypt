import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  ScrollView,
  Linking,
  Share,
  Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { slideInRight, slideInLeft } from "../../../assets/animations/index";
import { _database, _auth, TimeStamp } from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "react-native-progress/Circle";

const style = StyleSheet.create({
  mainContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  loading: {
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  loadingText: {
    textAlign: "center",
    margin: 15,
  },
  titleBar: {
    top: 20,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 3,
    height: 42,
    borderRadius: 10,
  },
  titleBtnOn: {
    flex: 1,
    marginRight: 20,
    fontFamily: "Raleway-Bold",
    textAlign: "center",
    alignSelf: "center",
    paddingTop: 5,
    fontSize: 20,
    color: "#fff",
  },
  titleBtn: {
    flex: 1,
    marginRight: 20,
    fontFamily: "Raleway-Regular",
    textAlign: "center",
    alignSelf: "center",
    paddingTop: 7,
    fontSize: 18,
    color: "#929292",
  },
  card: {
    margin: 20,
    marginBottom: 5,
    marginTop: 5,
    backgroundColor: "#fff",
    elevation: 10,
    borderRadius: 10,
    paddingTop: 10,
  },
  cardDate: {
    marginLeft: 10,
    fontFamily: "Raleway-Regular",
    color: "#918190",
    marginBottom: 5,
  },
  cardTitle: {
    fontFamily: "Raleway-Bold",
    fontSize: 22,
    color: "#000",
    borderLeftColor: "#ff011d",
    borderLeftWidth: 5,
    paddingLeft: 15,
    marginLeft: 10,
    marginBottom: 10,
  },
  cardType: {
    alignSelf: "flex-end",
    marginRight: 10,
    fontFamily: "Raleway-Regular",
    color: "#918190",
    marginBottom: 5,
  },
  cardBtn: {
    flex: 1,
    justifyContent: "center",
  },
  cardBtnIcon: {
    height: 25,
    width: 25,
    alignSelf: "center",
    margin: 15,
  },
  cardMessage: {
    marginRight: 10,
    marginLeft: 10,
    fontFamily: "Raleway-Regular",
    color: "#918190",
    marginBottom: 5,
  },
});

export default class EncryptDocument extends React.Component {
  state = {
    encrypted: [],
    decrypted: [],
    currentScreen: "enc",
    loading: true,
  };

  async readCache() {
    try {
      let jsonValue = await AsyncStorage.getItem("@App_Cache");
      if (jsonValue !== null) {
        jsonValue = JSON.parse(jsonValue.toString());
      } else jsonValue = {};
      this.setState({ ...jsonValue, loading: !!jsonValue.encrypted });
    } catch (e) {
      console.log(e);
      this.props.openTimedSnack("Caching Error", true);
    }
  }

  async writeCache(e, d) {
    try {
      const x = { decrypted: d, encrypted: e };
      let jsonValue = JSON.stringify(x);
      await AsyncStorage.setItem("@App_Cache", jsonValue);
    } catch (e) {
      this.props.openTimedSnack("Caching Error", true);
    }
    return true;
  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      {
        if (this.state.block) {
          this.props.openTimedSnack("Please Hold", true);
        } else this.props.goHome();
        return true;
      }
    });
    await this.readCache();
    this.db = _database.ref("users/" + _auth.currentUser.uid);
    this.db.on("value", (ds) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const e = [];
      ds.child("encryption").forEach((x) => {
        const z = x.val();
        const d = new Date(z.uploaded);
        const year = d.getFullYear();
        const monthName = months[d.getMonth()];
        const date = d.getDate();
        z.uploaded = year + "-" + monthName + "-" + date;
        z.id = x.key;
        e.push(z);
      });
      const de = [];
      ds.child("decryption").forEach((x) => {
        const z = x.val();
        const d = new Date(z.uploaded);
        const year = d.getFullYear();
        const monthName = months[d.getMonth()];
        const date = d.getDate();
        z.uploaded = year + "-" + monthName + "-" + date;
        z.id = x.key;
        de.push(z);
      });
      this.setState({ encrypted: e, decrypted: de, loading: false });
      this.writeCache(e, de);
    });
  }
  componentWillUnmount() {
    this.backHandler.remove();
    this.db.off();
  }

  card(x, i, last) {
    return (
      <View
        style={last ? { ...style.card, marginBottom: 30 } : style.card}
        key={i}
      >
        <Text style={style.cardDate}>Created: {x.uploaded}</Text>
        <Text style={style.cardTitle}>{x.title}</Text>
        {this.state.currentScreen === "enc" || x.type === "Document" ? (
          <View style={{ height: 30 }} />
        ) : (
          <View style={{ height: 0 }} />
        )}
        {this.state.currentScreen === "enc" || x.type === "Document" ? (
          <Text style={style.cardType}>{x.type}</Text>
        ) : (
          x.url.split("p").map((d, i) => {
            return (
              <Text style={style.cardMessage} key={i}>
                {d}
              </Text>
            );
          })
        )}
        <View
          style={{
            width: "100%",
            flex: 1,
            flexDirection: "row",
            backgroundColor: "#ff011d",
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            marginTop:
              this.state.currentScreen === "enc" || x.type === "Document"
                ? 10
                : 0,
          }}
        >
          <TouchableOpacity
            style={style.cardBtn}
            onPress={async () => {
              await setTimeout(async () => {
                this.props.startLoader();
                if (this.state.currentScreen === "enc")
                  await this.db.child("encryption/" + x.id).set({});
                else await this.db.child("decryption/" + x.id).set({});
                this.props.openTimedSnack("File Deleted", true);
                this.props.closeLoader();
              }, 200);
            }}
          >
            <Image
              style={style.cardBtnIcon}
              source={require("../../../assets/drawable/ic-delete.png")}
            />
          </TouchableOpacity>
          <View style={{ height: "100%", width: 2, backgroundColor: "#fff" }} />
          <TouchableOpacity
            style={style.cardBtn}
            onPress={async () => {
              await Share.share({
                message: x.url,
              });
            }}
          >
            <Image
              style={style.cardBtnIcon}
              source={require("../../../assets/drawable/ic-sharing.png")}
            />
          </TouchableOpacity>
          <View style={{ height: "100%", width: 2, backgroundColor: "#fff" }} />
          {this.state.currentScreen === "enc" || x.type === "Document" ? (
            <TouchableOpacity
              style={style.cardBtn}
              onPress={async () => {
                await setTimeout(() => {
                  Linking.openURL(x.url);
                }, 200);
              }}
            >
              <Image
                style={style.cardBtnIcon}
                source={require("../../../assets/drawable/ic-download.png")}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ display: "none" }} />
          )}
        </View>
      </View>
    );
  }

  render() {
    return this.state.loading ? (
      <View style={style.loading}>
        <ProgressBar size={80} indeterminate={true} color={"#454545"} />
        <Text style={style.loadingText}>{this.state.loading}</Text>
      </View>
    ) : (
      <Animatable.View
        animation={slideInRight}
        style={style.mainContent}
        duration={300}
      >
        <View style={style.titleBar}>
          <TouchableOpacity
            onPress={async () => {
              this.setState({ loaded: true });
              await setTimeout(() => {
                if (this.state.currentScreen !== "enc")
                  this.setState({ currentScreen: "enc" });
              }, 200);
            }}
            style={
              this.state.currentScreen === "enc"
                ? {
                    flex: 1,
                    backgroundColor: "#454545",
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                  }
                : {
                    flex: 1,
                  }
            }
          >
            <Text
              style={
                this.state.currentScreen === "enc"
                  ? style.titleBtnOn
                  : style.titleBtn
              }
            >
              Encrypted
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await setTimeout(() => {
                if (this.state.currentScreen !== "dec")
                  this.setState({ currentScreen: "dec", loaded: true });
              }, 200);
            }}
            style={
              this.state.currentScreen === "dec"
                ? {
                    flex: 1,
                    backgroundColor: "#454545",
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                  }
                : {
                    flex: 1,
                  }
            }
          >
            <Text
              style={
                this.state.currentScreen === "dec"
                  ? style.titleBtnOn
                  : style.titleBtn
              }
            >
              Decrypted
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
        {this.state.currentScreen === "enc" ? (
          <Animatable.View
            animation={this.state.loaded ? slideInLeft : undefined}
            style={{ flex: 1 }}
            duration={300}
          >
            <ScrollView style={{ flex: 1 }}>
              {this.state.encrypted.map((d, i) => {
                if (i === this.state.encrypted.length - 1) {
                  return this.card(d, i, true);
                } else return this.card(d, i);
              })}
            </ScrollView>
          </Animatable.View>
        ) : this.state.currentScreen === "dec" ? (
          <Animatable.View
            animation={slideInRight}
            style={{ flex: 1 }}
            duration={300}
          >
            <ScrollView style={{ flex: 1 }}>
              {this.state.decrypted.map((d, i) => {
                if (i === this.state.encrypted.length - 1) {
                  return this.card(d, i, true);
                } else return this.card(d, i);
              })}
            </ScrollView>
          </Animatable.View>
        ) : (
          <View />
        )}
      </Animatable.View>
    );
  }
}
