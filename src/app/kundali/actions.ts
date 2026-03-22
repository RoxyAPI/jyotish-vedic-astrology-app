'use server';

import { api } from '@/api/client';
import { hasApiKey } from '@/api/check-key';

export async function generateKundali(formData: {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
  lang?: string;
}) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }

  const body = {
    date: formData.date,
    time: formData.time,
    latitude: formData.latitude,
    longitude: formData.longitude,
    timezone: formData.timezone,
  };
  const langQuery = { query: { lang: formData.lang } };

  const [chart, navamsa, dashas, manglik, kalsarpa, sadhesati] = await Promise.all([
    api.POST('/birth-chart', { params: langQuery, body }),
    api.POST('/navamsa', { body }),
    api.POST('/dasha/major', { body }),
    api.POST('/dosha/manglik', { body }),
    api.POST('/dosha/kalsarpa', { body }),
    api.POST('/dosha/sadhesati', { body }),
  ]);

  return {
    chart: chart.data,
    navamsa: navamsa.data,
    dashas: dashas.data,
    manglik: manglik.data,
    kalsarpa: kalsarpa.data,
    sadhesati: sadhesati.data,
  };
}

export async function fetchDivisionalChart(formData: {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
  division: number;
}) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }
  const { data, error } = await api.POST('/divisional-chart', {
    body: {
      date: formData.date,
      time: formData.time,
      latitude: formData.latitude,
      longitude: formData.longitude,
      timezone: formData.timezone,
      division: formData.division,
    },
  });
  if (error) throw new Error('Failed to fetch divisional chart');
  return data;
}

export async function fetchStrengthAnalysis(formData: {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
}) {
  if (!hasApiKey()) {
    throw new Error('API key not configured. Add ROXYAPI_KEY to .env.local — get one at roxyapi.com/pricing');
  }
  const body = { date: formData.date, time: formData.time, latitude: formData.latitude, longitude: formData.longitude, timezone: formData.timezone };
  const [ashtakavarga, shadbala] = await Promise.all([
    api.POST('/ashtakavarga', { body }),
    api.POST('/shadbala', { body }),
  ]);
  return { ashtakavarga: ashtakavarga.data, shadbala: shadbala.data };
}
