'use server';
import { api } from '@/api/client';
import { hasApiKey } from '@/api/check-key';

export async function getMonthlyTransits(year: number, month: number, timezone: number) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }

  const { data, error } = await api.POST('/transit/monthly', {
    body: { year, month, timezone },
  });
  if (error) throw new Error('Failed to fetch transits');
  return data;
}

export async function getMonthlyAspects(year: number, month: number, timezone: number) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }

  const { data, error } = await api.POST('/aspects/monthly', {
    body: { year, month, timezone },
  });
  if (error) throw new Error('Failed to fetch monthly aspects');
  return data;
}
