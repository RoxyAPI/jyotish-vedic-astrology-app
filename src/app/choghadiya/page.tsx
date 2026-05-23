import type { Metadata } from 'next';
import { roxy, hasApiKey } from '@/lib/roxy/client';
import { tryUnwrap } from '@/lib/roxy/guard';
import { resolveDateAndLocation } from '@/lib/location';
import { formatDate } from '@/lib/format';
import { ApiKeyMissing } from '@/components/api-key-missing';
import { DateLocationControls } from '@/components/date-location-controls';
import { PageHeader } from '@/components/page-header';
import { DataError } from '@/components/data-error';
import { Separator } from '@/components/ui/separator';
import { ChoghadiyaView } from '@/components/roxy/choghadiya';
import { HoraTable } from '@/components/hora-table';

export const metadata: Metadata = {
  title: 'Choghadiya and Hora',
  description:
    'Day and night Choghadiya muhurta periods plus the 24 planetary Hora hours for activity timing on any date and city.',
};

/**
 * Choghadiya and Hora. Server Component: fetches both in parallel, renders the Choghadiya grid with the Roxy UI component and the Hora hours with a small bespoke table (no Roxy component exists for Hora).
 */
export default async function ChoghadiyaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasApiKey) return <ApiKeyMissing />;

  const { date, label, coords } = resolveDateAndLocation(await searchParams);
  const body = { date, ...coords };

  // Choghadiya and Hora return only times and planet names, so they are not i18n-aware (no lang query).
  const [choghadiya, hora] = await Promise.all([
    tryUnwrap(roxy.vedicAstrology.getChoghadiya({ body })),
    tryUnwrap(roxy.vedicAstrology.getHora({ body })),
  ]);

  return (
    <div className="space-y-8">
      <DateLocationControls date={date} label={label} />
      <PageHeader title="Choghadiya and Hora" subtitle={formatDate(date)} badge={label} />
      {'error' in choghadiya ? (
        <DataError message={choghadiya.error} />
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Choghadiya</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              8 muhurta periods each for day and night, marking auspicious and inauspicious windows
            </p>
            <ChoghadiyaView data={choghadiya.data} />
          </div>
          <Separator />
          {'error' in hora ? <DataError message={hora.error} /> : <HoraTable data={hora.data} />}
        </div>
      )}
    </div>
  );
}
