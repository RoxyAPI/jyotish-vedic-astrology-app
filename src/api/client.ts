import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const api = createClient<paths>({
  baseUrl: process.env.ROXYAPI_BASE_URL || 'https://roxyapi.com/api/v2/vedic-astrology',
  headers: {
    'X-API-Key': process.env.ROXYAPI_KEY!,
  },
});
