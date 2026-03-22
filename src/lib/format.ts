/**
 * Format an ISO local time string (e.g. "2026-03-22T06:41:00") to 12-hour display.
 * API returns local times without timezone suffix — extract HH:MM directly, no Date object.
 */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '--';
  const time = iso.split('T')[1];
  if (!time) return iso;
  const [hh, mm] = time.split(':');
  const h = parseInt(hh, 10);
  return `${h % 12 || 12}:${mm} ${h >= 12 ? 'pm' : 'am'}`;
}

/** Format a time range from two ISO strings. */
export function formatTimeRange(start: string | null | undefined, end: string | null | undefined): string {
  return `${formatTime(start)} \u2013 ${formatTime(end)}`;
}

/** Format an ISO date string to a readable date. */
export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format an ISO date string to a short readable date (e.g. "Sun, 22 Mar"). */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Today as YYYY-MM-DD. */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
