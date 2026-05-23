import type { GetLocationSearchResponse } from '@roxyapi/sdk';

/**
 * A single city result from `roxy.location.searchCities`, derived from the spec so it never drifts. The `/api/cities` route returns an array of these.
 */
export type City = NonNullable<GetLocationSearchResponse['cities']>[number];

/** Latitude, longitude, and decimal-hour timezone offset, the only fields every chart and panchang endpoint needs. */
export interface Coords {
  latitude: number;
  longitude: number;
  timezone: number;
}

/** Mumbai. The default location used until the user picks a city. */
export const DEFAULT_CITY = {
  label: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 5.5,
} as const;

/** Today as `YYYY-MM-DD`. */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Resolves a page's date and location from URL search params, falling back to today and Mumbai. The read pages keep their inputs in the URL, so this is how a Server Component recovers them on each render.
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
    date: str('date', todayString()),
    label: str('label', DEFAULT_CITY.label),
    coords: {
      latitude: num('lat', DEFAULT_CITY.latitude),
      longitude: num('lon', DEFAULT_CITY.longitude),
      timezone: num('tz', DEFAULT_CITY.timezone),
    },
  };
}
