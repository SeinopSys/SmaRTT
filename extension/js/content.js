chrome.storage.local.get(['origin'], ({ origin }) => {
  if (window.location.href.startsWith('http://backend.example.com/'.replace('backend.', ''))) {
    chrome.runtime.sendMessage({ token: localStorage.getItem('rttApp-prod-docker.token') });
  }
});

