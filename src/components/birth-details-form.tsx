'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CitySearch } from '@/components/city-search';
import { DEFAULT_CITY } from '@/lib/location';
import type { BirthDetails, City } from '@/lib/types';

/**
 * Shared birth-details form used by the Kundali and Matching pages.
 * Accepts a `BirthDetails` value and emits changes via `onChange`,
 * so the parent controls all state. The city search fetches through
 * the server-side `/api/cities` proxy so the secret key stays server-side.
 */
export function BirthDetailsForm({
  title,
  description,
  value,
  onChange,
  defaultCity = DEFAULT_CITY.label,
}: {
  title: string;
  description: string;
  value: BirthDetails;
  onChange: (next: BirthDetails) => void;
  defaultCity?: string;
}) {
  function onCity(city: City) {
    onChange({ ...value, latitude: city.latitude, longitude: city.longitude, timezone: city.utcOffset });
  }

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input type="time" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <CitySearch onSelect={onCity} defaultValue={defaultCity} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
