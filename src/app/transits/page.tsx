'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMonthlyTransits, getMonthlyAspects } from './actions';
import { formatDateShort } from '@/lib/format';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const YEARS = [2024, 2025, 2026, 2027] as const;

const PLANET_COLORS: Record<string, string> = {
  Sun: 'default',
  Moon: 'secondary',
  Mars: 'destructive',
  Mercury: 'outline',
  Jupiter: 'default',
  Venus: 'secondary',
  Saturn: 'outline',
  Rahu: 'destructive',
  Ketu: 'destructive',
};

type TransitEvent = {
  planet: string;
  fromSign: string;
  toSign: string;
  date: string;
  time: string;
  datetime: string;
  isRetrograde: boolean;
};

type StartingPosition = {
  planet: string;
  sign: string;
  longitude: number;
};

type TransitResult = {
  year: number;
  month: number;
  startingPositions: StartingPosition[];
  transitEvents: TransitEvent[];
};

type AspectEvent = {
  planet1: string;
  planet2: string;
  aspect: string;
  date: string;
  time: string;
  datetime: string;
  orb: number;
  distance: number;
  planet1Longitude: number;
  planet2Longitude: number;
};

type AspectsResult = {
  year: number;
  month: number;
  events: AspectEvent[];
};

const MAJOR_ASPECTS = new Set([
  'conjunction', 'opposition', 'trine', 'square', 'sextile',
]);

function formatAspectName(aspect: string): string {
  return aspect.charAt(0).toUpperCase() + aspect.slice(1).replace(/-/g, ' ');
}

function groupAspectsByDate(events: AspectEvent[]): Record<string, AspectEvent[]> {
  const groups: Record<string, AspectEvent[]> = {};
  for (const event of events) {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }
    groups[event.date].push(event);
  }
  return groups;
}


function groupByDate(events: TransitEvent[]): Record<string, TransitEvent[]> {
  const groups: Record<string, TransitEvent[]> = {};
  for (const event of events) {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }
    groups[event.date].push(event);
  }
  return groups;
}

export default function TransitsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [result, setResult] = useState<TransitResult | null>(null);
  const [aspectsResult, setAspectsResult] = useState<AspectsResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const [transits, aspects] = await Promise.all([
        getMonthlyTransits(Number(year), Number(month), 5.5),
        getMonthlyAspects(Number(year), Number(month), 5.5),
      ]);
      setResult(transits as TransitResult);
      setAspectsResult(aspects as AspectsResult);
    });
  }

  const grouped = result ? groupByDate(result.transitEvents) : {};
  const sortedDates = Object.keys(grouped).sort();

  const aspectsGrouped = aspectsResult ? groupAspectsByDate(aspectsResult.events) : {};
  const aspectsSortedDates = Object.keys(aspectsGrouped).sort();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Planetary Transits
        </h1>
        <p className="mt-2 text-muted-foreground">
          Monthly sign changes for all nine planets
        </p>
      </div>

      {/* Month/Year selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">Month</span>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((name, i) => (
                    <SelectItem key={name} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">Year</span>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Loading...' : 'View Transits'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Starting positions */}
          <Card>
            <CardHeader>
              <CardTitle>
                Positions on {MONTHS[result.month - 1]} 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {result.startingPositions.map((pos) => (
                  <div
                    key={pos.planet}
                    className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {pos.planet}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pos.sign}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Transit events timeline */}
          {sortedDates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No sign changes this month.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Sign Changes
              </h2>
              {sortedDates.map((date) => (
                <Card key={date}>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {formatDateShort(date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {grouped[date].map((event, i) => (
                        <div
                          key={`${event.planet}-${event.toSign}-${i}`}
                          className="flex items-center gap-3"
                        >
                          <Badge
                            variant={
                              (PLANET_COLORS[event.planet] as 'default' | 'secondary' | 'destructive' | 'outline') ??
                              'secondary'
                            }
                          >
                            {event.planet}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              {event.fromSign}{' '}
                              <span className="text-muted-foreground">to</span>{' '}
                              {event.toSign}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {event.isRetrograde && (
                              <Badge variant="outline" className="text-xs">
                                Rx
                              </Badge>
                            )}
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {event.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Planetary Aspects */}
          {aspectsResult && (
            <>
              <Separator />
              {aspectsSortedDates.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No planetary aspects this month.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Planetary Aspects
                  </h2>
                  {aspectsSortedDates.map((date) => (
                    <Card key={date}>
                      <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {formatDateShort(date)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aspectsGrouped[date].map((event, i) => (
                            <div
                              key={`${event.planet1}-${event.planet2}-${event.aspect}-${i}`}
                              className="flex items-center gap-3"
                            >
                              <Badge
                                variant={
                                  (PLANET_COLORS[event.planet1] as 'default' | 'secondary' | 'destructive' | 'outline') ??
                                  'secondary'
                                }
                              >
                                {event.planet1}
                              </Badge>
                              <Badge
                                variant={MAJOR_ASPECTS.has(event.aspect) ? 'default' : 'outline'}
                              >
                                {formatAspectName(event.aspect)}
                              </Badge>
                              <Badge
                                variant={
                                  (PLANET_COLORS[event.planet2] as 'default' | 'secondary' | 'destructive' | 'outline') ??
                                  'secondary'
                                }
                              >
                                {event.planet2}
                              </Badge>
                              <div className="flex-1" />
                              <span className="text-xs text-muted-foreground">
                                {event.orb.toFixed(2)}° orb
                              </span>
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {event.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
