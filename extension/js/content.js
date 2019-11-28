if (window.location.href.startsWith('http://rtt.dolphio.hu/')) {
  const token = localStorage.getItem('rttApp-prod-docker.token');
  if (token) {
    chrome.runtime.sendMessage({ token });
  }
}

