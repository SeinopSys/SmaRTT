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
  e => {
    console.log(e);
    return ({ cancel: true });
  },
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
