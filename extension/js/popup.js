import { getActiveTracking, getServerTime, getTrackings, getUser } from './api.js';
import storage from './storage.js';
import fa from './fa.js';
import {
  getWeekdaysInMonth,
  hoursToSeconds,
  isWorkday,
  log,
  origin,
  outputVersionInfo,
  pad,
  secondsToTimeDifferenceString,
  timeStringToSecondsSinceEpoch,
  updateProgress
} from './util.js';

const manifest = outputVersionInfo();
const options = document.getElementById('options');
options.addEventListener('click', e => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

const container = document.querySelector('.container');
const updateDataBtn = document.getElementById('update-data');
const updateCountdown = document.getElementById('update-countdown');
const username = document.getElementById('username');
const hours = document.getElementById('hours');
const workdays = document.getElementById('workdays');
const dailyProgress = document.getElementById('daily-progress');
const dailyProgressPercent = document.getElementById('daily-progress-percent');
const monthlyProgress = document.getElementById('monthly-progress');
const monthlyProgressPercent = document.getElementById('monthly-progress-percent');
let dataUpdateInterval, activeUpdateInterval, dataUpdateCountdown = 0;


const processIcons = () =>
  Array.from(document.querySelectorAll('.fa')).forEach(el => {
    for (const className of el.classList) {
      const iconName = className.replace(/^fa-/, '');
      if (typeof fa[iconName] !== 'undefined') {
        el.innerHTML = fa[iconName];
        break;
      }
    }
  });

const update = async () => {
  updateDataBtn.classList.add('disabled');
  updateDataBtn.children[0].classList.add('fa-spin');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const monthLastDayDate = new Date(currentYear, currentMonth, 0);

  // Synchronize local and server time
  const serverTime = await getServerTime();
  const timeOffsetMs = Date.now() - serverTime.getTime();
  log('Local clock is %fms %s server time', Math.abs(timeOffsetMs), timeOffsetMs > 0 ? 'ahead' : 'behind');

  return Promise.all([
    getUser(),
    getTrackings(
      `${currentYear}-${pad(currentMonth)}-01`,
      `${currentYear}-${pad(currentMonth)}-${monthLastDayDate.getDate()}`,
      'false'
    ),
    getActiveTracking(),
    storage.get(['hours', 'updateCountdown', 'workdayOffset'])
  ]).then(([userData, trackings, activeTracking, settings]) => {
    const {
      hours: workHoursPerDay,
      updateCountdown: defaultUpdateCountdown,
      workdayOffset,
    } = settings;
    username.innerText = userData.userName;
    hours.innerText = workHoursPerDay;
    // TODO Use the calendar page for more accurate data
    const monthlyWorkdays = getWeekdaysInMonth(currentYear, currentMonth - 1) - workdayOffset;
    workdays.innerText = String(monthlyWorkdays);

    let totalSecondsWorkedThisMonth = 0, totalSecondsWorkedToday = 0;
    // Workaround for <progress> max attribute having a minimum value of 1
    monthlyProgress.dataset.max = hoursToSeconds(monthlyWorkdays * workHoursPerDay);
    monthlyProgress.max = monthlyProgress.dataset.max;
    dailyProgress.dataset.max = isWorkday(currentYear, currentMonth - 1, currentDay) ? hoursToSeconds(workHoursPerDay) : 0;
    dailyProgress.max = dailyProgress.dataset.max;

    if (trackings && trackings.length > 0) {
      totalSecondsWorkedThisMonth = trackings.reduce((acc, el) => {
        const timeSpent = el.trackings && el.trackings.length > 0
          ? el.trackings.reduce((innerAcc, innerEl) => {
            const toSecs = timeStringToSecondsSinceEpoch(innerEl.workTimeTo);
            const fromSecs = timeStringToSecondsSinceEpoch(innerEl.workTimeFrom);
            return innerAcc + (toSecs - fromSecs);
          }, 0)
          : 0;
        return acc + timeSpent;
      }, 0);

      const todaysDate = `${currentYear}-${pad(currentMonth)}-${pad(currentDay)}`;
      const todaysTracking = trackings.find(el => el.date === todaysDate);
      if (todaysTracking && todaysTracking.trackings && todaysTracking.trackings.length > 0) {
        totalSecondsWorkedToday = todaysTracking.trackings.reduce(
          (acc, el) => acc + (timeStringToSecondsSinceEpoch(el.workTimeTo) - timeStringToSecondsSinceEpoch(el.workTimeFrom)),
          0
        );
      }
    }

    const updateMonth = () =>
      updateProgress(timeOffsetMs, monthlyProgress, monthlyProgressPercent, totalSecondsWorkedThisMonth, activeTracking);
    let updateTodayCounter = 0;
    const updateTodayIntervalMs = 1000;
    const updatesTodayPerSecond = 1000 / updateTodayIntervalMs;
    const updateToday = () => {
      updateMonth();
      const timeDiff = updateProgress(timeOffsetMs, dailyProgress, dailyProgressPercent, totalSecondsWorkedToday, activeTracking);
      if (updateTodayCounter === 0) {
        document.title = document.title.replace(/^.* -/, `${timeDiff} -`)
      }
      if (++updateTodayCounter > updatesTodayPerSecond) {
        updateTodayCounter = 0;
      }
    };
    updateToday();
    if (activeUpdateInterval) {
      clearInterval(activeUpdateInterval);
    }
    if (activeTracking) {
      activeUpdateInterval = setInterval(updateToday, updateTodayIntervalMs);
    }

    container.classList.remove('d-none');
    updateDataBtn.classList.remove('disabled');
    updateDataBtn.children[0].classList.remove('fa-spin');
    dataUpdateCountdown = defaultUpdateCountdown;
    return true;
  }).catch(err => {
    const failureContainer = document.createElement('div');
    failureContainer.id = 'failure-container';
    document.body.appendChild(failureContainer);
    const alert = document.createElement('div');
    alert.classList.add('alert');
    const alertText = document.createTextNode(
      err instanceof Error
      ? `${manifest.name} - ${err.name} (${err.message})`
      : 'Unexpected error while loading tracking data'
    );
    const loadingIcon = document.createElement('i');
    loadingIcon.classList.add('fa', 'fa-sync-alt', 'fa-staggered-spin', 'ml-2');
    alert.appendChild(alertText);
    alert.appendChild(loadingIcon);
    failureContainer.appendChild(alert);
    processIcons();
    storage.get('token').then(token => {
      if (!token) {
        alertText.textContent = 'Kérlek jelentkezz be az RTT-be a kiegészítő használatához!';
        const frame = document.createElement('iframe');
        frame.src = origin.replace('backend.', '');
        failureContainer.appendChild(frame);
      }
      const waitForTokenRecursive = () => {
        storage.get('token').then(currentToken => {
          if (currentToken) {
            window.location.reload();
            return;
          }

          setTimeout(waitForTokenRecursive, 2e3);
        });
      };
      waitForTokenRecursive();
    });
    return false;
  });
};

const updateData = async e => {
  if (e) e.preventDefault();
  if (updateDataBtn.classList.contains('disabled')) {
    return;
  }
  const recurse = async function recurse(force = false) {
    if (dataUpdateCountdown <= 0 || force) {
      if (dataUpdateInterval) {
        clearInterval(dataUpdateInterval);
      }
      dataUpdateCountdown = 0;
      update().then(success => {
        if (success) {
          recurse();
          dataUpdateInterval = setInterval(recurse, 1000);
        }
      });
    }
    if (dataUpdateCountdown >= 0) {
      updateCountdown.innerHTML = secondsToTimeDifferenceString(dataUpdateCountdown, false).replace(/^00:0/g, '');
      dataUpdateCountdown--;
    }
  };
  recurse(true);
};

processIcons();
updateData();
updateDataBtn.addEventListener('click', updateData);
