import createClient from 'openapi-fetch';
import type { paths } from './location-schema';

export const locationApi = createClient<paths>({
  baseUrl: process.env.ROXYAPI_BASE_URL?.replace('/vedic-astrology', '/location') || 'https://roxyapi.com/api/v2/location',
  headers: {
    'X-API-Key': process.env.ROXYAPI_KEY!,
  },
});
