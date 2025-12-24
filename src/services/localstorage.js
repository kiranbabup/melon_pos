// localStorage.js
export const storageKey = "melon";

class LsService {
  ls = window.localStorage;

  setItem(key, value) {
    value = JSON.stringify(value);
    this.ls.setItem(key, value);
    return true;
  }

  getItem(key) {
    let value = this.ls.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  removeItem(key) {
    this.ls.removeItem(key);
    return true;
  }

  setCurrentUser(values) {
    this.setItem(storageKey, values);
  }

  updateCurrentUser(values) {
    let data = {
      ...this.getCurrentUser(),
      fullname: values.fullname,
    };
    this.setItem(storageKey, data);
    return data;
  }

  getCurrentUser() {
    let data = this.getItem(storageKey);
    if (!data) {
      return null;
    }
    return data;
  }

  removeCurrentUser() {
    this.removeItem(storageKey);
    return true;
  }

  getAccessToken() {
    const user = this.getCurrentUser();
    return user?.accessToken || null;
  }

  getRefreshToken() {
    const user = this.getCurrentUser();
    return user?.refreshToken || null;
  }

}

export default new LsService();
