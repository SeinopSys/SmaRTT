import storage from './storage.js';
import { FetchError, isNotOwnTime, origin, tryJsonParse } from './util.js';

const fetchAuthenticated = (url, options) =>
  storage.get('token')
    .then(token => fetch(origin + url.substring(1), {
      ...options,
      'credentials': 'include',
      'headers': { 'accept': 'application/json', 'rtt_login_token': token }
    }))
    .then(response => {
      if (response.ok) return response.text();
      return response.text().then(responseText => {
        throw new FetchError(`HTTP ${response.status} ${response.statusText}`.trim(), response, responseText);
      });
    })
    .then(text => text.length === 0 ? null : tryJsonParse(text));

export const getUser = () => fetchAuthenticated('/users/current');

export const getTrackings = (startDate, endDate, withModReqs) =>
  fetchAuthenticated(`/users/current/trackings?startDate=${startDate}&endDate=${endDate}&withModReqs=${withModReqs}`)
    // Filter out "Own time" tracking entries
    .then(trackings => trackings.map(tracking => ({
      ...tracking,
      trackings: tracking.trackings.filter(isNotOwnTime)
    })));

export const getActiveTracking = () => fetchAuthenticated('/users/current/trackings/active')
  .then(activeTracking => isNotOwnTime(activeTracking) ? activeTracking : null);

export const getServerTime = () => fetchAuthenticated('/time').then(time => new Date(time)).catch(() => new Date());
