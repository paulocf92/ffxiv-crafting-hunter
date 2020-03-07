import AsyncStorage from '@react-native-community/async-storage';

class Storage {
  static async getItem(key) {
    const item = await AsyncStorage.getItem(key);
    return JSON.parse(item);
  }

  static async setItem(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static async removeItem(key) {
    await AsyncStorage.removeItem(key);
  }

  static async getAllKeys() {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  }

  static async multiGet(keys) {
    const returned = await AsyncStorage.multiGet(keys);
    return returned;
  }
}

export default Storage;
