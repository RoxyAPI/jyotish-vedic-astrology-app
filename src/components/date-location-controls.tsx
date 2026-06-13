'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CitySearch } from '@/components/city-search';
import type { City } from '@/lib/types';

/**
 * Date + city picker for the read pages (panchang, choghadiya). The selection is encoded in the URL query string and pushed with the router, which re-runs the Server Component on the same route so it re-fetches with the new inputs. Keeping state in the URL makes every view shareable and back-button friendly with no client data store.
 */
export function DateLocationControls({
  date: initialDate,
  label: initialLabel,
}: {
  date: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [date, setDate] = useState(initialDate);
  const [city, setCity] = useState<City | null>(null);
  const [pending, startTransition] = useTransition();

  function update() {
    const params = new URLSearchParams({ date });
    if (city) {
      params.set('lat', String(city.latitude));
      params.set('lon', String(city.longitude));
      params.set('tz', String(city.utcOffset));
      params.set('label', `${city.city}, ${city.country}`);
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <Card className="overflow-visible">
      <CardContent className="overflow-visible pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-shrink-0">
            <Label htmlFor="date-input">Date</Label>
            <Input
              id="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full sm:w-auto"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Label>City</Label>
            <div className="mt-1.5">
              <CitySearch onSelect={setCity} defaultValue={initialLabel} />
            </div>
          </div>
          <Button onClick={update} disabled={pending}>
            {pending ? 'Loading...' : 'Update'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
