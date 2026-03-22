'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchPanchang } from '@/app/actions';
import { CitySearch, type CityResult } from '@/components/city-search';
import { useLanguage } from '@/components/language-provider';
import { formatTime, formatTimeRange, formatDate, getTodayString } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PanchangData = any;

const MUMBAI_DEFAULTS = {
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 5.5,
};

export default function Home() {
  const { lang } = useLanguage();
  const [date, setDate] = useState(getTodayString());
  // Pending = what user picks in the form. Active = what was last fetched.
  const [pending, setPending] = useState({ label: 'Mumbai, India', ...MUMBAI_DEFAULTS });
  const [active, setActive] = useState({ label: 'Mumbai, India', ...MUMBAI_DEFAULTS });
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPanchang = useCallback(
    async (d: string, loc: typeof pending, language: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPanchang({
          date: d,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timezone: loc.timezone,
          lang: language,
        });
        setData(result);
        setActive(loc);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch panchang data'
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-fetch on mount
  useEffect(() => {
    loadPanchang(date, pending, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCitySelect(city: CityResult) {
    setPending({
      label: `${city.city}, ${city.country}`,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.utcOffset,
    });
  }

  function handleUpdate() {
    loadPanchang(date, pending, lang);
  }

  // Build auspicious periods from data
  const auspiciousPeriods: { name: string; start?: string; end?: string }[] =
    data
      ? [
          ...(data.brahmaMuhurta
            ? [{ name: 'Brahma Muhurta', ...data.brahmaMuhurta }]
            : []),
          ...(data.abhijitMuhurta
            ? [{ name: 'Abhijit Muhurta', ...data.abhijitMuhurta }]
            : []),
          ...(data.vijayaMuhurta
            ? [{ name: 'Vijaya Muhurta', ...data.vijayaMuhurta }]
            : []),
          ...(data.godhuliMuhurta
            ? [{ name: 'Godhuli Muhurta', ...data.godhuliMuhurta }]
            : []),
          ...(data.amritKalam
            ? data.amritKalam.map(
                (period: { start: string; end: string }, i: number) => ({
                  name:
                    data.amritKalam.length > 1
                      ? `Amrit Kalam ${i + 1}`
                      : 'Amrit Kalam',
                  ...period,
                })
              )
            : []),
        ]
      : [];

  // Build inauspicious periods from data
  const inauspiciousPeriods: { name: string; start?: string; end?: string }[] =
    data
      ? [
          ...(data.rahuKaal
            ? [{ name: 'Rahu Kaal', ...data.rahuKaal }]
            : []),
          ...(data.yamaganda
            ? [{ name: 'Yamaganda', ...data.yamaganda }]
            : []),
          ...(data.gulika
            ? [{ name: 'Gulika Kaal', ...data.gulika }]
            : []),
          ...(data.durMuhurta
            ? data.durMuhurta.map(
                (period: { start: string; end: string }, i: number) => ({
                  name:
                    data.durMuhurta.length > 1
                      ? `Dur Muhurta ${i + 1}`
                      : 'Dur Muhurta',
                  ...period,
                })
              )
            : []),
          ...(data.varjyam
            ? data.varjyam.map(
                (period: { start: string; end: string }, i: number) => ({
                  name:
                    data.varjyam.length > 1
                      ? `Varjyam ${i + 1}`
                      : 'Varjyam',
                  ...period,
                })
              )
            : []),
        ]
      : [];

  return (
    <div className="space-y-8">
      {/* Controls bar */}
      <Card className="overflow-visible">
        <CardContent className="pt-6 overflow-visible">
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
                <CitySearch
                  onSelect={handleCitySelect}
                  defaultValue="Mumbai, India"
                />
              </div>
            </div>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? 'Loading...' : 'Update'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Unable to load Panchang</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Data display */}
      {data && !loading && (
        <>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Panchang
            </h1>
            <p className="mt-2 text-muted-foreground">
              {formatDate(data.date)}
            </p>
            <Badge variant="secondary" className="mt-3">
              {active.label}
            </Badge>
          </div>

          <div className="space-y-6">
            {/* Core Panchang */}
            <Card>
              <CardHeader>
                <CardTitle>Panchang</CardTitle>
                <CardDescription>
                  Five limbs of the Hindu calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tithi
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {data.tithi?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.tithi?.paksha} Paksha
                    </p>
                    {data.tithi?.percent != null && (
                      <p className="text-xs text-muted-foreground">{Math.round(data.tithi.percent)}% elapsed</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nakshatra
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {data.nakshatra?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lord: {data.nakshatra?.lord} &middot; Pada{' '}
                      {data.nakshatra?.pada}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Yoga
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {data.yoga?.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Karana
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {data.karana?.name}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Vara
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {data.vara?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lord: {data.vara?.lord}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sun & Moon */}
            <Card>
              <CardHeader>
                <CardTitle>Sun &amp; Moon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Sunrise
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatTime(data.sunrise)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Sunset
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatTime(data.sunset)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Moonrise
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatTime(data.moonrise)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Moonset
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatTime(data.moonset)}
                    </p>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Moon Sign
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {data.moonSign?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.moonSign?.sanskritName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Sun Sign
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {data.sunSign?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.sunSign?.sanskritName}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auspicious Periods */}
            {auspiciousPeriods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Auspicious Periods</CardTitle>
                  <CardDescription>
                    Favorable windows for important activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auspiciousPeriods.map((period) => (
                      <div
                        key={period.name}
                        className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-primary">
                          {period.name}
                        </span>
                        <span className="text-sm tabular-nums text-primary">
                          {formatTimeRange(period.start, period.end)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inauspicious Periods */}
            {inauspiciousPeriods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Inauspicious Periods</CardTitle>
                  <CardDescription>
                    Avoid starting new ventures during these times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inauspiciousPeriods.map((period) => (
                      <div
                        key={period.name}
                        className="flex items-center justify-between rounded-lg bg-destructive/10 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-destructive">
                          {period.name}
                        </span>
                        <span className="text-sm tabular-nums text-destructive">
                          {formatTimeRange(period.start, period.end)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
