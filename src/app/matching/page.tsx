import type { Metadata } from 'next';
import { hasApiKey } from '@/lib/roxy/client';
import { getLang } from '@/lib/lang.server';
import { ApiKeyMissing } from '@/components/api-key-missing';
import { MatchingClient } from './matching-client';

export const metadata: Metadata = {
  title: 'Kundali Matching',
  description:
    'Ashtakoot Gun Milan: 36-point Vedic compatibility for two birth charts, with the eight koota breakdown and dosha analysis.',
};

/**
 * Matching route. Server Component boundary: checks the key and reads the active language, then renders the client form. Submitting runs a Server Action that calls Gun Milan.
 */
export default async function MatchingPage() {
  if (!hasApiKey) return <ApiKeyMissing />;
  const lang = await getLang();
  return <MatchingClient lang={lang} />;
}
