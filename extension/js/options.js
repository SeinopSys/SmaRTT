import storage from './storage.js';
import { outputVersionInfo, setThemeClass } from './util.js';

setThemeClass();
outputVersionInfo();

const settingsForm = document.getElementById('settings');
const submitButton = settingsForm.querySelector('button');
const getInputs = () => Array.from(settingsForm.querySelectorAll('input'));

const inputs = getInputs().reduce((settings, el) => ({ ...settings, [el.id]: el }), {});
storage.get(Object.keys(inputs)).then(settings => {
  if (settings) {
    Object.keys(settings).forEach(inputName => {
      if (typeof inputs[inputName] === 'undefined') {
        console.error(`inputs[${inputName}] is undefined`);
        return;
      }
      switch (inputs[inputName].type) {
        case 'checkbox':
          inputs[inputName].checked = settings[inputName];
          break;
        default:
          inputs[inputName].value = settings[inputName];
      }
    });
  }
  submitButton.disabled = false;
});

settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  submitButton.disabled = true;
  const newSettings = getInputs().reduce((settings, el) => {
    if (!el.matches('input'))
      return settings;

    let value;
    switch (el.type) {
      case 'checkbox':
        value = el.checked ? '1' : '0';
        break;
      case 'number':
      case 'password':
      case 'text':
      default:
        value = el.value;
    }
    return { ...settings, [el.id]: value };
  }, {});

  storage.set(newSettings)
    .then(() => void location.reload())
    .catch(e => {
      console.log(e);
      alert('Could not update settings');
    })
    .finally(() => {
      submitButton.disabled = false;
    });
});
