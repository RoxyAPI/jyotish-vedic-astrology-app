import type { components } from './schema';

export type BirthChartResponse = components['schemas']['BirthChartResponse'];
export type NavamsaResponse = components['schemas']['NavamsaResponse'];
export type CompatibilityResponse = components['schemas']['CompatibilityResponse'];
export type ManglikResponse = components['schemas']['ManglikResponse'];
export type KalsarpaResponse = components['schemas']['KalsarpaResponse'];
export type SadhesatiResponse = components['schemas']['SadhesatiResponse'];
export type AshtakavargaResponse = components['schemas']['AshtakavargaResponse'];
export type ShadbalaResponse = components['schemas']['ShadbalaResponse'];
export type DivisionalChartResponse = components['schemas']['DivisionalChartResponse'];

/** Shape of a single sign entry (aries, taurus, etc.) in the birth chart */
export type SignData = BirthChartResponse['aries'];

/** Shape of a single planet entry in the meta lookup */
export type ChartMetaEntry = BirthChartResponse['meta'][string];

/**
 * Extended BirthChartResponse with sign index access and extra fields.
 * The generated schema only defines `aries` + `meta`, but the actual API
 * response includes all 12 sign keys plus combustion, interpretations, etc.
 */
export type BirthChartData = BirthChartResponse & {
  [sign: string]: SignData | BirthChartResponse['meta'] | unknown;
  combustion?: { planet: string; distanceFromSun: number; orb: number }[];
  interpretations?: { [planet: string]: { rashi?: string; nakshatra?: string } };
  planetaryWar?: { planet1: string; planet2: string; distance: number }[];
};

/** Common fields shared by ManglikResponse, KalsarpaResponse, SadhesatiResponse */
export type DoshaResponse = ManglikResponse | KalsarpaResponse | SadhesatiResponse;
