'use server';
import { api } from '@/api/client';
import { hasApiKey } from '@/api/check-key';

export async function calculateCompatibility(formData: {
  person1: { date: string; time: string; latitude: number; longitude: number; timezone: number };
  person2: { date: string; time: string; latitude: number; longitude: number; timezone: number };
}) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }

  const { data, error } = await api.POST('/compatibility', {
    body: {
      person1: formData.person1,
      person2: formData.person2,
    },
  });
  if (error) throw new Error('Failed to calculate compatibility');
  return data;
}
