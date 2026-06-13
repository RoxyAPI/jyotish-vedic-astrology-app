import type { GetLocationSearchResponse } from '@roxyapi/sdk';

/**
 * A single city result from `roxy.location.searchCities`, derived from the spec so it never drifts.
 * The `/api/cities` route returns an array of these.
 */
export type City = NonNullable<GetLocationSearchResponse['cities']>[number];

/** Latitude, longitude, and decimal-hour timezone offset, the only fields every chart and panchang endpoint needs. */
export interface Coords {
  latitude: number;
  longitude: number;
  timezone: number;
}

/** Birth details: date, time, and geographic coordinates. Shared by kundali generation and matching. */
export interface BirthDetails extends Coords {
  date: string;
  time: string;
}
