import type { Coords } from '@/lib/types';

// Re-export types from the shared types module for backward compatibility.
// New code should import directly from '@/lib/types'.
export type { City, Coords } from '@/lib/types';

/** Mumbai. The default location used until the user picks a city. */
export const DEFAULT_CITY = {
  label: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 5.5,
} as const;

/**
 * Resolves a page's date and location from URL search params, falling back to today and Mumbai.
 * The read pages keep their inputs in the URL, so this is how a Server Component recovers them on each render.
 */
export function resolveDateAndLocation(params: Record<string, string | string[] | undefined>): {
  date: string;
  label: string;
  coords: Coords;
} {
  const num = (key: string, fallback: number) => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = value === undefined ? Number.NaN : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const str = (key: string, fallback: string) => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value ?? fallback;
  };

  return {
    date: str('date', new Date().toISOString().split('T')[0]),
    label: str('label', DEFAULT_CITY.label),
    coords: {
      latitude: num('lat', DEFAULT_CITY.latitude),
      longitude: num('lon', DEFAULT_CITY.longitude),
      timezone: num('tz', DEFAULT_CITY.timezone),
    },
  };
}
