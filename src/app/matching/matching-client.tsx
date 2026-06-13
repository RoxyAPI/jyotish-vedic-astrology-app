'use client';

import { useState, useTransition } from 'react';
import { RoxyGunaMilan, type RoxyGunaMilanProps } from '@roxyapi/ui-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BirthDetailsForm } from '@/components/birth-details-form';
import { DEFAULT_CITY } from '@/lib/location';
import type { BirthDetails } from '@/lib/types';
import type { Lang } from '@/lib/lang';
import { calculateMatch } from './actions';

const PERSON1_DEFAULT: BirthDetails = { date: '1990-07-04', time: '10:00', ...DEFAULT_CITY };
const PERSON2_DEFAULT: BirthDetails = {
  date: '1992-03-15',
  time: '14:30',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 5.5,
};

/**
 * Kundali matching. A Server Action runs Ashtakoot Gun Milan for both charts;
 * the typed score flows straight into `RoxyGunaMilan`, which renders the
 * 36-point breakdown and dosha analysis.
 */
export function MatchingClient({ lang }: { lang: Lang }) {
  const [person1, setPerson1] = useState(PERSON1_DEFAULT);
  const [person2, setPerson2] = useState(PERSON2_DEFAULT);
  const [result, setResult] = useState<RoxyGunaMilanProps['data']>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const data = await calculateMatch({
          person1: { ...person1, time: `${person1.time}:00` },
          person2: { ...person2, time: `${person2.time}:00` },
          lang,
        });
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate compatibility');
        setResult(undefined);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Kundali Matching</h1>
        <p className="mt-2 text-muted-foreground">Ashtakoot Gun Milan compatibility analysis</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BirthDetailsForm
          title="Person 1"
          description="Enter birth details"
          value={person1}
          onChange={setPerson1}
          defaultCity="Mumbai, India"
        />
        <BirthDetailsForm
          title="Person 2"
          description="Enter birth details"
          value={person2}
          onChange={setPerson2}
          defaultCity="Delhi, India"
        />
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={submit} disabled={pending}>
          {pending ? 'Calculating...' : 'Check Compatibility'}
        </Button>
      </div>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      {result && (
        <div className="space-y-6">
          <Separator />
          <RoxyGunaMilan data={result} />
        </div>
      )}
    </div>
  );
}
