chrome.storage.local.get(['replaceLogo'], result => {
  if (result.replaceLogo === '0')
    return;

  const manifest = chrome.runtime.getManifest();
  let headingElement;
  const recurse = () => {
    headingElement = document.getElementById('heading');
    if (!headingElement) {
      setTimeout(recurse, 10);
      return;
    }

    headingElement.children[0].src = chrome.runtime.getURL('images/logo64.png');
    headingElement.children[1].innerHTML = manifest.name;
  };
  recurse();
});
