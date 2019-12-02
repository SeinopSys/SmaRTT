import storage from './storage.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (typeof request.token !== 'string') {
    sendResponse(false);
    return;
  }
  storage.set('token', request.token);
  sendResponse(true);
});
chrome.webRequest.onBeforeRequest.addListener(
  () => ({ cancel: true }),
  {
    urls: ['http://signin.rtt.dolphio.hu/*']
  },
  ['blocking']
);
chrome.declarativeWebRequest.onRequest.addRules([
  {
    conditions: [
      new chrome.declarativeWebRequest.RequestMatcher({
        url: { hostEquals: 'signin.rtt.dolphio.hu' }
      })
    ],
    actions: [
      new chrome.declarativeWebRequest.CancelRequest()
    ]
  }
]);
chrome.tabs.onCreated.addListener(tab => {
  if (tab.pendingUrl !== 'chrome://newtab/') return;
  storage.get('replaceNewTab').then(replaceNewTabSetting => {
    if (!replaceNewTabSetting) return;
    chrome.tabs.update(tab.id, {
      url: chrome.extension.getURL('index.html')
    });
  });
});
