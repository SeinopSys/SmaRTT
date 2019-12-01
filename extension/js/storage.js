import { castSettings } from './util.js';

const defaultSettings = {
  hours: '7.5',
  updateCountdown: '30',
  workdayOffset: '0',
  token: null,
};

const get = key => new Promise(res => {
  const arg = typeof key === 'string' ? [key] : key;
  chrome.storage.local.get(arg, function (result) {
    const finalValue = castSettings({ ...defaultSettings, ...result });
    res(typeof key === 'string' ? finalValue[key] : finalValue);
  });
});

const set = (key, value) => new Promise(res => {
  const arg = typeof key === 'string' ? { [key]: value } : key;
  chrome.storage.local.set(arg, function () {
    res();
  });
});

export default { get, set };
