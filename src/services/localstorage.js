// localStorage.js
const days = 1;
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
    const now = new Date();
    now.setDate(now.getDate() + days);
    let data = { ...values, expiry: now.getTime() };
    this.setItem(storageKey, data);
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
    const now = new Date();
    let data = this.getItem(storageKey);
    if (!data) {
      return null;
    }
    if (now.getTime() > data.expiry) {
      this.removeCurrentUser();
      return null;
    }
    return data;
  }

  removeCurrentUser() {
    this.removeItem(storageKey);
    return true;
  }
}

export default new LsService();
