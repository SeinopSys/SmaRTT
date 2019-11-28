export const origin = 'http://backend.rtt.dolphio.hu/';

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
  const padstr = new Array(targetLength - input.length + 1).join(padWith);
  input = fromLeft === true ? padstr + input : input + padstr;

  return input;
};

export const round = (number, decimals) => {
  const precision = Math.pow(10, decimals);
  return Math.round(number * precision) / precision;
};

export const timeStringToSecondsSinceEpoch = timeStr => ~~(new Date(`1970-01-01T${timeStr}Z`).getTime() / 1000);
export const secondsToHoursString = seconds => `${seconds > 0 ? '-' : '+'}${round(Math.abs(seconds) / 60 / 60, 2)}h`;

export const hoursToSeconds = hours => hours * 60 * 60;

export const formatPercent = float => `${Math.round(float * 100)}%`;

export const getWeekdaysInMonth = (year, month) =>
  new Array(32 - new Date(year, month, 32).getDate())
    .fill(1)
    .filter(
      (id, index) =>
        [0, 6].indexOf(
          new Date(year, month, index + 1).getDay()) === -1
    ).length;
