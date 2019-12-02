import { castSettings } from './util.js';

const defaultSettings = {
  hours: '7.5',
  updateCountdown: '30',
  workdayOffset: '0',
  token: null,
  replaceLogo: '1',
  replaceNewTab: '0',
  darkTheme: '0',
};

const get = key => new Promise(res => {
  const arg = typeof key === 'string' ? [key] : key;
  chrome.storage.local.get(arg, result => {
    const finalValue = castSettings({ ...defaultSettings, ...result });
    res(typeof key === 'string' ? finalValue[key] : finalValue);
  });
});

const set = (key, value) => new Promise(res => {
  const arg = typeof key === 'string' ? { [key]: value } : key;
  chrome.storage.local.set(arg, () => res());
});

export default { get, set };
