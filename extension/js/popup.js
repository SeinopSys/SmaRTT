import { getTrackings, getUser } from "./api.js";
import storage from './storage.js';
import {
  formatPercent,
  getWeekdaysInMonth,
  hoursToSeconds,
  pad,
  secondsToHoursString,
  timeStringToSecondsSinceEpoch
} from './util.js';

const container = document.querySelector('.container');
const username = document.getElementById('username');
const email = document.getElementById('email');
const hours = document.getElementById('hours');
const dailyProgress = document.getElementById('daily-progress');
const dailyProgressPercent = document.getElementById('daily-progress-percent');
const monthlyProgress = document.getElementById('monthly-progress');
const monthlyProgressPercent = document.getElementById('monthly-progress-percent');

const update = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const monthLastDayDate = new Date(currentYear, currentMonth, 0);

  Promise.all([
    getUser(),
    getTrackings(
      `${currentYear}-${pad(currentMonth)}-01`,
      `${currentYear}-${pad(currentMonth)}-${monthLastDayDate.getDate()}`,
      'false'
    ),
    storage.get(['hours'])
  ]).then(([response, trackings, { hours: workHoursPerDay }]) => {
    username.innerText = response.userName;
    email.innerText = response.email;
    hours.innerText = workHoursPerDay;

    if (trackings && trackings.length > 0) {
      const monthlyWeekdays = getWeekdaysInMonth(currentYear, currentMonth - 1);
      monthlyProgress.max = hoursToSeconds(monthlyWeekdays * workHoursPerDay);
      const totalSecondsWorkedThisMonth = trackings.reduce(
        (acc, el) => acc + (
          el.trackings && el.trackings.length > 0
            ? el.trackings.reduce(
            (innerAcc, innerEl) => innerAcc + (
              timeStringToSecondsSinceEpoch(innerEl.workTimeTo) - timeStringToSecondsSinceEpoch(innerEl.workTimeFrom)
            ),
            0
            )
            : 0),
        0
      );
      monthlyProgress.value = totalSecondsWorkedThisMonth;
      monthlyProgressPercent.innerText = `${formatPercent(totalSecondsWorkedThisMonth / monthlyProgress.max)} (${secondsToHoursString(monthlyProgress.max - totalSecondsWorkedThisMonth)})`;

      const todaysDate = `${currentYear}-${pad(currentMonth)}-${pad(currentDay)}`;
      const todaysTracking = trackings.find(el => el.date === todaysDate);

      // TODO Get currently running item
      dailyProgress.max = hoursToSeconds(workHoursPerDay);
      if (todaysTracking && todaysTracking.trackings && todaysTracking.trackings.length > 0) {
        const totalSecondsWorkedToday = todaysTracking.trackings.reduce(
          (acc, el) => acc + (timeStringToSecondsSinceEpoch(el.workTimeTo) - timeStringToSecondsSinceEpoch(el.workTimeFrom)),
          0
        );
        dailyProgress.value = totalSecondsWorkedToday;
        dailyProgressPercent.innerText = `${formatPercent(totalSecondsWorkedToday / dailyProgress.max)} (${secondsToHoursString(dailyProgress.max - totalSecondsWorkedToday)})`;
      } else {
        dailyProgress.value = 0;
        dailyProgressPercent.innerText = `${formatPercent(0)} (${secondsToHoursString(dailyProgress.max)})`;
      }
    }

    container.classList.remove('d-none');
  }).catch(err => {
    console.error(err);
  });
};

update();
setInterval(update, 30e3);
