const sendToken = () =>
  chrome.runtime.sendMessage({ token: localStorage.getItem('rttApp-prod-docker.token') }, resp =>
    void resp || setTimeout(sendToken, 2000)
  );
sendToken();
