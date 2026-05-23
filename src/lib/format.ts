/**
 * Format an ISO local time string (e.g. "2026-03-22T06:41:00") to 12-hour display. The API returns local times with no timezone suffix, so the HH:MM is read directly with no Date object (avoids a UTC reinterpretation).
 */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '--';
  const time = iso.split('T')[1];
  if (!time) return iso;
  const [hh, mm] = time.split(':');
  const h = parseInt(hh, 10);
  return `${h % 12 || 12}:${mm} ${h >= 12 ? 'pm' : 'am'}`;
}

/** Format a time range from two ISO strings, e.g. "6:41 am to 7:30 am". */
export function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  return `${formatTime(start)} to ${formatTime(end)}`;
}

/** Format an ISO date string to a readable long date. */
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
