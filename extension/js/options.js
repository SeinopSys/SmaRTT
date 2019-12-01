import storage from './storage.js';
import { outputVersionInfo } from './util.js';

outputVersionInfo();

const settingsForm = document.getElementById('settings');
const submitButton = settingsForm.querySelector('button');

const inputs = Array.from(settingsForm.children).reduce(
  (settings, el) => el.matches('input') ? { ...settings, [el.id]: el } : settings
);
storage.get(Object.keys(inputs)).then(settings => {
  if (settings) {
    Object.keys(settings).forEach(inputName => {
      inputs[inputName].value = settings[inputName];
    });
  }
  submitButton.disabled = false;
});

settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  submitButton.disabled = true;
  const newSettings = Array.from(settingsForm.children).reduce(
    (settings, el) => el.matches('input') ? { ...settings, [el.id]: el.value } : settings
  );

  storage.set(newSettings).then(() => {
    submitButton.disabled = false;
  })
    .catch(e => {
      console.log(e);
      alert('Could not update settings');
    })
    .finally(() => {
      submitButton.disabled = false;
    });
})
;
