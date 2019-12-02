const sendToken = () =>
  chrome.runtime.sendMessage({ token: localStorage.getItem('rttApp-prod-docker.token') }, resp =>
    void resp || setTimeout(sendToken, 2000)
  );
sendToken();

$(() => {
  requestAnimationFrame(() => {
    $('#heading > span.name').html('SmarRTT');
    $('#heading > img').attr('src', chrome.extension.getURL("images/logo256.png"));
  });
});
