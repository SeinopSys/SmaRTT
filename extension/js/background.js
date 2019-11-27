import storage from './storage.js';
import { origin } from './util.js';

chrome.runtime.onMessage.addListener(request => void storage.set('token', request.token));

const frame = document.createElement('iframe');
frame.src = origin;
frame.append(document.body);
