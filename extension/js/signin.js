chrome.storage.local.get(['blockSignIn'], result => {
  if (result.blockSignIn === '0')
    return;
  const styleTag = document.createElement('style');
  styleTag.innerText = '.signin-modal,.signin-modal+.modal-backdrop{display:none!important}';
  document.documentElement.appendChild(styleTag);
});
