'use server';

import { api } from '@/api/client';
import { hasApiKey } from '@/api/check-key';

export async function fetchChoghadiya(formData: {
  date: string;
  latitude: number;
  longitude: number;
  timezone: number;
}) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }

  const body = {
    date: formData.date,
    latitude: formData.latitude,
    longitude: formData.longitude,
    timezone: formData.timezone,
  };

  const [choghadiya, hora] = await Promise.all([
    api.POST('/panchang/choghadiya', { body }),
    api.POST('/panchang/hora', { body }),
  ]);

  if (choghadiya.error) throw new Error('Failed to fetch choghadiya data');
  if (hora.error) throw new Error('Failed to fetch hora data');

  return { choghadiya: choghadiya.data, hora: hora.data };
}
