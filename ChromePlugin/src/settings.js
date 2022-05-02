
const Settings = {
  setApiKey(value) {
    console.log('Storing apikey with ', value);
    window.localStorage.setItem('apiKey', value);
  },
  getApiKey() {
    return window.localStorage.getItem('apiKey');
  },
  setServerUrl(value) {
    console.log('Storing serverUrl with ', value);
    window.localStorage.setItem('serverUrl', value);
  },
  getServerUrl() {
    return window.localStorage.getItem('serverUrl');
  },
};

export default Settings;
