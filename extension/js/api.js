import storage from './storage.js';
import { origin } from './util.js';

export const fetchAuthenticated = (url, options) =>
  storage.get('token')
    .then(token =>
      fetch(origin + url.substring(1), {
        ...options,
        'credentials': 'include',
        'headers': { 'accept': 'application/json', 'rtt_login_token': token }
      })
    )
    .then(res => res.json());

export const getUser = () => fetchAuthenticated('/users/current');

export const getTrackings = (startDate, endDate, withModReqs) => fetchAuthenticated(`/users/current/trackings?startDate=${startDate}&endDate=${endDate}&withModReqs=${withModReqs}`);
