setTimeout(function() {
  const manifest = chrome.runtime.getManifest();
  document.querySelector("#heading > span.name").innerHTML = manifest.name;
  document.querySelector("#heading > img").src = chrome.runtime.getURL(
    "images/logo256.png"
  );
}, 50);
