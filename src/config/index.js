import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";

export const _auth = auth();
export const _database = database();
export const _storage = storage();
export const GoogleAuthProvider = auth.GoogleAuthProvider;
export const CLIENT_ID =
  "919824918200-ujfnr6rj001o05s71ceort1qknvg31dp.apps.googleusercontent.com";
