'use server';

import { api } from '@/api/client';
import { hasApiKey } from '@/api/check-key';

export async function fetchPanchang(formData: {
  date: string;
  latitude: number;
  longitude: number;
  timezone: number;
  lang?: string;
}) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }

  const { data, error } = await api.POST('/panchang/detailed', {
    params: { query: { lang: formData.lang } },
    body: {
      date: formData.date,
      latitude: formData.latitude,
      longitude: formData.longitude,
      timezone: formData.timezone,
    },
  });

  if (error) throw new Error('Failed to fetch panchang data');
  return data;
}
