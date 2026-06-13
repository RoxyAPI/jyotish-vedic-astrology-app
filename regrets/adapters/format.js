// Adapter: Pure formatting functions from src/lib/format.ts
// These are exact copies of the source logic for Regrets fingerprinting.
// The source of truth is always src/lib/format.ts — if that changes, this adapter must be updated.

/**
 * Format an ISO local time string (e.g. "2026-03-22T06:41:00") to 12-hour display.
 */
export function formatTime(iso) {
  if (!iso) return '--';
  const time = iso.split('T')[1];
  if (!time) return iso;
  const [hh, mm] = time.split(':');
  const h = parseInt(hh, 10);
  return `${h % 12 || 12}:${mm} ${h >= 12 ? 'pm' : 'am'}`;
}

/** Format a time range from two ISO strings, e.g. "6:41 am to 7:30 am". */
export function formatTimeRange(start, end) {
  return `${formatTime(start)} to ${formatTime(end)}`;
}

/** Format an ISO date string to a readable long date. */
export function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format an ISO date string to a short readable date (e.g. "Sun, 22 Mar"). */
export function formatDateShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
