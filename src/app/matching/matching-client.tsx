'use client';

import { useState, useTransition } from 'react';
import { RoxyGunaMilan, type RoxyGunaMilanProps } from '@roxyapi/ui-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CitySearch } from '@/components/city-search';
import { DEFAULT_CITY, type City, type Coords } from '@/lib/location';
import type { Lang } from '@/lib/lang';
import { calculateMatch } from './actions';

interface PersonState extends Coords {
  date: string;
  time: string;
}

const PERSON1_DEFAULT: PersonState = { date: '1990-07-04', time: '10:00', ...DEFAULT_CITY };
const PERSON2_DEFAULT: PersonState = {
  date: '1992-03-15',
  time: '14:30',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 5.5,
};

function PersonForm({
  label,
  defaultCity,
  value,
  onChange,
}: {
  label: string;
  defaultCity: string;
  value: PersonState;
  onChange: (next: PersonState) => void;
}) {
  function onCity(city: City) {
    onChange({ ...value, latitude: city.latitude, longitude: city.longitude, timezone: city.utcOffset });
  }
  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Enter birth details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Birth Date</Label>
          <Input type="date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Birth Time</Label>
          <Input type="time" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <CitySearch onSelect={onCity} defaultValue={defaultCity} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Kundali matching. A Server Action runs Ashtakoot Gun Milan for both charts; the typed score flows straight into `RoxyGunaMilan`, which renders the 36-point breakdown and dosha analysis.
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
        <PersonForm label="Person 1" defaultCity="Mumbai, India" value={person1} onChange={setPerson1} />
        <PersonForm label="Person 2" defaultCity="Delhi, India" value={person2} onChange={setPerson2} />
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
