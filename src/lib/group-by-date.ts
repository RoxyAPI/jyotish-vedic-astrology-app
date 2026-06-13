/**
 * Group an array of dated events into sorted [date, events[]] pairs.
 * Generic utility for any timeline or chronology view.
 */
export function groupByDate<T extends { date: string }>(events: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const e of events) {
    const list = groups.get(e.date) ?? [];
    list.push(e);
    groups.set(e.date, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}
