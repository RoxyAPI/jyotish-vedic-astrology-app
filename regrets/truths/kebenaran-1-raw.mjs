// KEBENARAN 1 — Raw output of all entry functions
// This is the ground truth. Run directly, no Regrets involved.
// Saved at: Phase 2, before any refactoring

import { formatTime, formatTimeRange, formatDate, formatDateShort } from '../adapters/format.js';
import { toLang } from '../adapters/lang.js';
import { resolveDateAndLocation } from '../adapters/location.js';
import { messageForCode } from '../adapters/guard.js';
import { cn } from '../adapters/utils.js';

const results = {};

// format-time
results['format-time'] = {
  '2026-03-22T06:41:00': formatTime('2026-03-22T06:41:00'),
  '2026-03-22T14:30:00': formatTime('2026-03-22T14:30:00'),
  'null': formatTime(null),
  'empty-string': formatTime(''),
  '2026-03-22T00:00:00': formatTime('2026-03-22T00:00:00'),
  '2026-03-22T12:00:00': formatTime('2026-03-22T12:00:00'),
  '2026-03-22T23:59:00': formatTime('2026-03-22T23:59:00'),
};

// format-time-range
results['format-time-range'] = {
  '06:41-to-07:30': formatTimeRange('2026-03-22T06:41:00', '2026-03-22T07:30:00'),
  '14:00-to-16:30': formatTimeRange('2026-03-22T14:00:00', '2026-03-22T16:30:00'),
  'null-to-null': formatTimeRange(null, null),
  '00:00-to-23:59': formatTimeRange('2026-03-22T00:00:00', '2026-03-22T23:59:00'),
};

// format-date
results['format-date'] = {
  '2026-03-22': formatDate('2026-03-22'),
  '2026-01-01': formatDate('2026-01-01'),
  '2026-12-31': formatDate('2026-12-31'),
  '2000-02-29': formatDate('2000-02-29'),
};

// format-date-short
results['format-date-short'] = {
  '2026-03-22': formatDateShort('2026-03-22'),
  '2026-01-01': formatDateShort('2026-01-01'),
  '2026-12-31': formatDateShort('2026-12-31'),
  '2000-02-29': formatDateShort('2000-02-29'),
};

// to-lang
results['to-lang'] = {
  'en': toLang('en'),
  'hi': toLang('hi'),
  'fr': toLang('fr'),
  'xx': toLang('xx'),
  'empty': toLang(''),
  'null': toLang(null),
  'de': toLang('de'),
  'ru': toLang('ru'),
};

// resolve-date-location
results['resolve-date-location'] = {
  'delhi': resolveDateAndLocation({ date: '2026-06-14', lat: '28.6139', lon: '77.209', tz: '5.5', label: 'Delhi, India' }),
  'empty': resolveDateAndLocation({}),
  'date-only': resolveDateAndLocation({ date: '2026-01-01' }),
  'nyc-coords': resolveDateAndLocation({ lat: '40.7128', lon: '-74.006', tz: '-5' }),
};

// message-for-code
results['message-for-code'] = {
  'validation_error': messageForCode('validation_error', 'bad input'),
  'api_key_required': messageForCode('api_key_required', null),
  'invalid_api_key': messageForCode('invalid_api_key', null),
  'rate_limit_exceeded': messageForCode('rate_limit_exceeded', 'slow down'),
  'not_found': messageForCode('not_found', null),
  'unknown_code': messageForCode('unknown_code', 'something went wrong'),
  'null-code': messageForCode(null, null),
};

// cn-merge
results['cn-merge'] = {
  'override-px': cn('px-4 py-2', 'px-6'),
  'color-override': cn('text-red-500', 'text-blue-500'),
  'empty-plus-class': cn('', 'px-4'),
  'three-classes': cn('px-4', 'py-2', 'bg-white'),
  'empty-array': cn([]),
};

console.log(JSON.stringify(results, null, 2));
