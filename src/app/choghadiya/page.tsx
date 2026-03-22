'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchChoghadiya } from '@/app/choghadiya/actions';
import { CitySearch, type CityResult } from '@/components/city-search';
import { useLanguage } from '@/components/language-provider';
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

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '--';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  return `${formatTime(start)} \u2013 ${formatTime(end)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

type ChoghadiyaPeriod = {
  name: 'Udveg' | 'Amrit' | 'Rog' | 'Labh' | 'Shubh' | 'Char' | 'Kaal';
  lord: string;
  effect: 'Good' | 'Bad';
  start: string;
  end: string;
};

type HoraPeriod = {
  planet: string;
  number: number;
  start: string;
  end: string;
};

type ChoghadiyaData = {
  date: string;
  dayChoghadiya: ChoghadiyaPeriod[];
  nightChoghadiya: ChoghadiyaPeriod[];
};

type HoraData = {
  date: string;
  dayHoras: HoraPeriod[];
  nightHoras: HoraPeriod[];
};

function getEffectClasses(effect: 'Good' | 'Bad', name: string): string {
  if (effect === 'Bad') return 'bg-destructive/10 text-destructive';
  // "Good" includes both truly auspicious (Shubh, Labh, Amrit) and neutral (Udveg, Char)
  // But per schema, Char is "Good" effect. Udveg is always "Bad".
  // Neutral: Char (Venus) — good but used for travel/movement only
  if (name === 'Char') return 'bg-muted text-muted-foreground';
  return 'bg-primary/10 text-primary';
}

const MUMBAI_DEFAULTS = {
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 5.5,
};

export default function ChoghadiyaPage() {
  const { lang } = useLanguage();
  const [date, setDate] = useState(getTodayString());
  const [pending, setPending] = useState({ label: 'Mumbai, India', ...MUMBAI_DEFAULTS });
  const [active, setActive] = useState({ label: 'Mumbai, India', ...MUMBAI_DEFAULTS });
  const [choghadiya, setChoghadiya] = useState<ChoghadiyaData | null>(null);
  const [hora, setHora] = useState<HoraData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (d: string, loc: typeof pending) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchChoghadiya({
          date: d,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timezone: loc.timezone,
        });
        setChoghadiya(result.choghadiya as ChoghadiyaData);
        setHora(result.hora as HoraData);
        setActive(loc);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch data'
        );
        setChoghadiya(null);
        setHora(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-fetch on mount
  useEffect(() => {
    loadData(date, pending);
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
    loadData(date, pending);
  }

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
              <CardTitle>Unable to load data</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Data display */}
      {choghadiya && hora && !loading && (
        <>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Choghadiya &amp; Hora
            </h1>
            <p className="mt-2 text-muted-foreground">
              {formatDate(choghadiya.date)}
            </p>
            <Badge variant="secondary" className="mt-3">
              {active.label}
            </Badge>
          </div>

          <div className="space-y-6">
            {/* Choghadiya Section */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Choghadiya
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                8 muhurta periods for day and night, indicating auspicious and inauspicious time windows
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Day Choghadiya */}
                <Card>
                  <CardHeader>
                    <CardTitle>Day Choghadiya</CardTitle>
                    <CardDescription>Sunrise to sunset</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {choghadiya.dayChoghadiya.map((period, i) => (
                        <div
                          key={`day-${i}`}
                          className={`flex items-center justify-between rounded-lg px-4 py-3 ${getEffectClasses(period.effect, period.name)}`}
                        >
                          <div>
                            <span className="text-sm font-medium">
                              {period.name}
                            </span>
                            <span className="ml-2 text-xs opacity-70">
                              {period.lord}
                            </span>
                          </div>
                          <span className="text-sm tabular-nums">
                            {formatTimeRange(period.start, period.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Night Choghadiya */}
                <Card>
                  <CardHeader>
                    <CardTitle>Night Choghadiya</CardTitle>
                    <CardDescription>Sunset to next sunrise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {choghadiya.nightChoghadiya.map((period, i) => (
                        <div
                          key={`night-${i}`}
                          className={`flex items-center justify-between rounded-lg px-4 py-3 ${getEffectClasses(period.effect, period.name)}`}
                        >
                          <div>
                            <span className="text-sm font-medium">
                              {period.name}
                            </span>
                            <span className="ml-2 text-xs opacity-70">
                              {period.lord}
                            </span>
                          </div>
                          <span className="text-sm tabular-nums">
                            {formatTimeRange(period.start, period.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Hora Section */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Hora
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                24 planetary hours (12 day + 12 night), each ruled by a planet in the Chaldean sequence
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Day Horas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Day Horas</CardTitle>
                    <CardDescription>12 periods from sunrise to sunset</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {hora.dayHoras.map((h) => (
                        <div
                          key={`day-hora-${h.number}`}
                          className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-xs text-muted-foreground">
                              {h.number}
                            </span>
                            <span className="font-medium text-foreground">
                              {h.planet}
                            </span>
                          </div>
                          <span className="tabular-nums text-muted-foreground">
                            {formatTimeRange(h.start, h.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Night Horas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Night Horas</CardTitle>
                    <CardDescription>12 periods from sunset to next sunrise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {hora.nightHoras.map((h) => (
                        <div
                          key={`night-hora-${h.number}`}
                          className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-xs text-muted-foreground">
                              {h.number}
                            </span>
                            <span className="font-medium text-foreground">
                              {h.planet}
                            </span>
                          </div>
                          <span className="tabular-nums text-muted-foreground">
                            {formatTimeRange(h.start, h.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
