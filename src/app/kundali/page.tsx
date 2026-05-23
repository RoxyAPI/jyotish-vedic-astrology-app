import type { Metadata } from 'next';
import { hasApiKey } from '@/lib/roxy/client';
import { getLang } from '@/lib/lang.server';
import { ApiKeyMissing } from '@/components/api-key-missing';
import { KundaliClient } from './kundali-client';

export const metadata: Metadata = {
  title: 'Kundali',
  description:
    'Generate a Vedic birth chart (kundli) with planetary positions, divisional charts, Vimshottari dasha, dosha detection, and Ashtakavarga and Shadbala strength.',
};

/**
 * Kundali route. Server Component boundary: it checks the key and reads the active language, then hands off to the client form. The form submit runs a Server Action that fans out to every Vedic endpoint.
 */
export default async function KundaliPage() {
  if (!hasApiKey) return <ApiKeyMissing />;
  const lang = await getLang();
  return <KundaliClient lang={lang} />;
}
