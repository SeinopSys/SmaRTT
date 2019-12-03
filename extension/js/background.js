import storage from './storage.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (typeof request.token !== 'string') {
    sendResponse(false);
    return;
  }
  storage.set('token', request.token);
  sendResponse(true);
});
chrome.tabs.onCreated.addListener(tab => {
  if ((tab.url || tab.pendingUrl) !== 'chrome://newtab/') {
    return;
  }
  storage.get('replaceNewTab').then(replaceNewTabSetting => {
    if (!replaceNewTabSetting) return;
    chrome.tabs.update(tab.id, {
      url: chrome.extension.getURL('index.html')
    });
  });
});
