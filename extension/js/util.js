import storage from './storage.js';

export const origin = 'http://backend.rtt.dolphio.hu/';

export const ownTimeProjectId = 1;

export const pad = (input, padWith, targetLength, fromLeft) => {
  if (typeof input !== 'string')
    input = '' + input;

  if (typeof padWith !== 'string')
    padWith = '0';
  if (typeof targetLength !== 'number' && !isFinite(targetLength) && isNaN(targetLength))
    targetLength = 2;
  else targetLength = parseInt(targetLength, 10);
  if (typeof fromLeft !== 'boolean')
    fromLeft = true;

  if (targetLength <= input.length)
    return input;
  const padString = new Array(targetLength - input.length + 1).join(padWith);
  input = fromLeft === true ? padString + input : input + padString;

  return input;
};

export const timeStringToSecondsSinceEpoch = timeStr => {
  const currentYear = new Date().getFullYear();
  return ~~((new Date(`${currentYear}-01-01T${timeStr}Z`).getTime() - new Date(`${currentYear}-01-01T00:00:00Z`).getTime()) / 1000);
};

export const hoursToSeconds = hours => hours * 60 * 60;

// Floor is used to avoid displaying 100% until the target time actually passes
export const formatPercent = float => `${Math.floor(float * 100)}%`;

export const isWorkday = (year, jsMonth, day) => [0, 6].indexOf(new Date(year, jsMonth, day).getDay()) === -1;

export const getWeekdaysInMonth = (year, month) =>
  new Array(32 - new Date(year, month, 32).getDate())
    .fill(1)
    .filter((id, index) => isWorkday(year, month, index + 1)).length;

const timeInSeconds = {
  hour: 3600,
  minute: 60,
};
export const secondsToTimeDifferenceString = (seconds, prefix = true) => {
  let absSecond = Math.abs(seconds), time = absSecond;

  const hour = Math.floor(time / timeInSeconds.hour);
  time -= hour * timeInSeconds.hour;

  const minute = Math.floor(time / timeInSeconds.minute);
  time -= minute * timeInSeconds.minute;

  const second = Math.floor(time);

  return (prefix && Math.floor(absSecond) !== 0 ? (seconds > 0 ? '-' : '+') : '') + [pad(hour), pad(minute), pad(second)].join(':');
};

export const updateProgress = (timeOffsetMs, bar, percent, currentWorkedSeconds, activeTracking) => {
  if (activeTracking) {
    const activeWorkFrom = timeStringToSecondsSinceEpoch(activeTracking.workTimeFrom);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const activeWorkTo = Math.max(
      timeStringToSecondsSinceEpoch(activeTracking.workTimeTo),
      ~~(((Date.now() - timeOffsetMs) - todayMidnight.getTime()) / 1000)
    );
    currentWorkedSeconds += activeWorkTo - activeWorkFrom;
  }
  bar.value = currentWorkedSeconds;
  const barMax = Number(bar.dataset.max);
  const timeDiff = secondsToTimeDifferenceString(barMax - currentWorkedSeconds);
  percent.innerText = `${timeDiff}${barMax !== 0 ? ` (${formatPercent(currentWorkedSeconds / barMax)})` : ''}`;
  if (currentWorkedSeconds > barMax) {
    bar.classList.add('overtime');
  } else {
    bar.classList.remove('overtime');
  }
  return timeDiff;
};

export const castSettings = settings => ({
  ...settings,
  hours: Number(settings.hours),
  updateCountdown: Number(settings.updateCountdown),
  workdayOffset: Number(settings.workdayOffset),
  replaceLogo: settings.replaceLogo === '1',
  replaceNewTab: settings.replaceNewTab === '1',
  darkTheme: settings.darkTheme === '1',
  blockSignIn: settings.blockSignIn === '1',
});

export class InvalidJsonError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'InvalidJsonError';
  }
}

export class FetchError extends Error {
  constructor(message, response, responseText) {
    super(`${message}: ${responseText}`);
    this.name = 'FetchError';
    this.response = response;
  }
}

export const tryJsonParse = text => {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new InvalidJsonError(text);
  }
};

export const outputVersionInfo = (elementId = 'version') => {
  const version = document.getElementById(elementId);
  const manifest = chrome.runtime.getManifest();
  version.innerText = `${manifest.name} ${manifest.version}`;
  return manifest;
};

export const setThemeClass = () => {
  storage.get('darkTheme').then(darkTheme => {
    if (darkTheme) {
      document.documentElement.classList.add('dark-theme');
    }
  })
};

export const log = (...args) => {
  const manifest = chrome.runtime.getManifest();
  if (typeof args[0] === 'string') {
    args[0] = `[${manifest.name} v${manifest.version}] ${args[0]}`;
  }
  console.log(...args);
};

export const isNotOwnTime = tracking => tracking && tracking.projectID !== ownTimeProjectId;
